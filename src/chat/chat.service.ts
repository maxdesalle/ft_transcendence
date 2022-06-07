import { BadRequestException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { Conversation, GroupConfig, Session } from './DTO/chat-user.dto';

const PARTICIPANT = 0;
const ADMIN = 1;
const OWNER = 2;

// adapts typeORM's EntityManager.query results to pq.Pool.query results format 
// so I can use dszklarz's code without too many changes
class queryAdaptor {
	constructor(private manager: EntityManager) {}

	async query(sql_query: string) {
		const result = await this.manager.query(sql_query);
		return {
			rowCount: result.length,
			rows: result
		}
	}
}

// class Group {
// 	name: string;
// 	owner: number;
// 	private: boolean;
// 	password: string
// 	participants: number[];
	
// 	constructor(owner_id: number, config: GroupConfig) {
// 		this.name = config.name;
// 		this.owner = owner_id;
// 		this.private = config.private 
// 		this.password = config.password;
// 		this.participants = [owner_id];
// 	}
// }

@Injectable()
export class ChatService {
	pool: queryAdaptor;

	constructor(private connection: Connection) {
		this.pool = new queryAdaptor(connection.manager);
	}

	// sets Session.selected_room to id
	// if msg == true, populates Session.messages with new messages
	async on_select(me: Session, id: number, msg: boolean) {
		me.selected_room = id;
		// me.messages = [];
		if (msg)
			await this.get_message(me);
	}

	// populates Session.messages with new messages
	// room must be previously selected
	async get_message(me: Session) {
		// let last_time;
		let my_query: { rowCount: any; rows: any; };
		// if (me.messages.length > 0) {
		// 	last_time = new Date(me.messages[0].timestamp).getTime() / 1000;
		// 	my_query = await this.pool.query(
		// 		`SELECT id, user_id, message, timestamp FROM message
		// 		WHERE room_id = ${me.selected_room}
		// 		AND timestamp > to_timestamp(${last_time})
		// 		AND user_id NOT IN (SELECT blocked_id FROM blocked WHERE user_id= ${me.id})
		// 		ORDER BY timestamp DESC`
		// 	);
		// }
		// else
			my_query = await this.pool.query(
				`SELECT id, user_id, message, timestamp FROM message
				WHERE room_id = ${me.selected_room}
				AND user_id NOT IN (SELECT blocked_id FROM blocked WHERE user_id= ${me.id})
				ORDER BY timestamp DESC`
			);
		me.messages = []; // Rodolpho moved this from on_select to here
		for (let i = 0; i < my_query.rowCount; i++)
			me.messages.push(my_query.rows[i]);
	}

	// TODO: review this: being blocked might not have anything to do with rooms? 
	// or will be this used to fetch DM rooms too?
	async getMessagesByRoomId(me: Session, room_id: number) {
		const my_query = await this.pool.query(
			`SELECT id, user_id, message, timestamp FROM message
			WHERE room_id = ${room_id}
			AND user_id NOT IN (SELECT blocked_id FROM blocked WHERE user_id= ${me.id})
			ORDER BY timestamp DESC`
		);
		return my_query.rows;
	}

	async send_dm(me: Session, message: string) {
		await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${me.id}, NOW(), '${message}', ${me.selected_room})`);
	}


	async get_room_msgs(me: Session, room_id: number) {
		const query = await this.pool.query(
			`SELECT id, user_id, message, timestamp FROM message
			WHERE room_id = ${room_id}
			AND user_id NOT IN (SELECT blocked_id FROM blocked WHERE user_id= ${me.id})
			ORDER BY timestamp DESC`
		);
		return query.rows;
	}

	async getDMbyUser(me: Session, friend_id: number) {
		if (me.id === friend_id)
			throw new BadRequestException("No talking to yourself, plz...")
		const room_id = await this.get_dm_room(me, friend_id);
		if (!room_id)
			return [];
		return this.get_room_msgs(me, room_id);
	}


	async sendDMtoUser(me: Session, toId: number, msg: string) {
		if (me.id === toId)
			throw new BadRequestException("You shall not talk to yourself");
		// check if room exists
		let room_id = await this.get_dm_room(me, toId);
		// create room if necessary
		// console.log(room_id);
		if (!room_id) 
			room_id = await this.create_dm_room(me, toId);
		// insert message into table	
		await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${me.id}, NOW(), '${msg}', ${room_id})`
		);
		return await this.get_room_msgs(me, room_id);
	}

	// returns list of blocked users ID
	async get_blocked(me: Session) {
		let my_query = await this.pool.query(
			`SELECT blocked_id FROM blocked WHERE user_id=${me.id}
			UNION SELECT user_id FROM blocked WHERE blocked_id=${me.id}`
		);
		const blocked = [];
		for (let i = 0; i < my_query.rowCount; i++)
			blocked.push(my_query.rows[i].blocked_id);
		return blocked;
	}

	async block(me: Session, block_id: number) {
		if (me.id === block_id)
			throw new BadRequestException("blocking yourself... that's kinda weird");
		await this.pool.query(
			`INSERT INTO blocked(user_id, blocked_id)
			VALUES(${me.id}, ${block_id})
			ON CONFLICT DO NOTHING`
		);
		// //friend_id is referenced but does not exist -> changed to block_id
		// let tmp = await pool.query(`SELECT room_id FROM participants WHERE room_id in (SELECT room_id FROM participants WHERE user_id = ${block_id}) AND user_id =${me.id} AND room_id NOT IN (SELECT id FROM room WHERE NOT owner=0)`);
		// if (tmp.rowCount > 0 && me.selected_room == tmp.rows[0].room_id)
		// 	await on_select(me, me.conversations.length ? me.conversations[0].id : 0, false);
		// await refresh(me);
	}

	async unblock(me: Session, block_id: number) {
		await this.pool.query(
			`DELETE FROM blocked WHERE blocked_id=${block_id} and user_id=${me.id}`
		);
		// // changed friend_id to block_id
		// let tmp = await pool.query(`SELECT room_id FROM participants WHERE room_id in (SELECT room_id FROM participants WHERE user_id = ${block_id}) AND user_id =${me.id} AND room_id NOT IN (SELECT id FROM room WHERE NOT owner=0)`);
		// await on_select(tmp.rows[0].room_id, false);
		// await refresh(me);
	}

	async getRoomParcipants(room_id: number) {
		const query = await this.pool.query(
			`SELECT user_id FROM participants
			WHERE room_id=${room_id};
			`
		);
		const res = [];
		for (let i = 0; i < query.rowCount; i++) {
			res.push(query.rows[i].user_id);
		}
		return res;
	}

	// returns array of conversations
	async  get_convs(me: Session) {
		const blocked = await this.get_blocked(me);
		let room_query = await this.pool.query(
			`SELECT id, name, owner FROM room
			WHERE id IN (SELECT room_id FROM participants WHERE user_id = ${me.id})
			ORDER BY activity DESC`
		);
		const conversations = [];
		for (let i = 0; i < room_query.rowCount; i++) //for every conversation
		{
			let room_row = room_query.rows[i];
			let room_id = room_row.id;
			let part_q = await this.pool.query(`
				SELECT user_id FROM participants
				WHERE room_id = ${room_row.id}`
			);
			if (!room_row.owner && (blocked.includes(part_q.rows[0].user_id) || blocked.includes(part_q.rows[1].user_id)))
				continue;
			let my_status = await this.pool.query(`
				SELECT status FROM chat_user WHERE id= ${part_q.rows[0].user_id}`
			);
			let tmp = new Conversation(room_id, room_row.name, my_status.rows[0].status);
			// tmp.id		= room_id;
			// tmp.name	= room_row.name;
			// tmp.status	= my_status.rows[0].status;
			for (let n = 0; n < part_q.rowCount; n++) //get all participants of a given conversation
				tmp.participants.push(part_q.rows[n].user_id);
			conversations.push(tmp);
		}
		return conversations;
	}

	// returns room_id of dm room between user, null if non-existant
	async get_dm_room(me: Session, friend_id: number): Promise<null|number> {
		const dm_room = await this.pool.query(`
			SELECT id FROM room
			JOIN participants ON id=room_id
			WHERE id IN
				(SELECT id from room
				JOIN participants ON id=room_id
				WHERE owner IS NULL
				AND user_id=${me.id})
			AND user_id=${friend_id};`
		);
		if (!dm_room.rowCount)
			return null;
		return dm_room.rows[0].id;
	}

	async getDMusersID(me: Session) {
		const friends = await this.pool.query(`
			SELECT user_id FROM room
			JOIN participants ON id=room_id
			WHERE id IN
				(SELECT id from room
				JOIN participants ON id=room_id
				WHERE owner IS NULL
				AND user_id=${me.id})
			AND user_id!=${me.id};`
		);

		console.log(friends);
		return (friends.rows);
	}


	// TODO: throw exceptions if new room is not created
	async create_dm_room(me: Session, friend_id: number) {
		// this has apparently something to do with unblocking someone if
		// you decide to send him a DM
		// let tmp = await this.pool.query(
		// 	`SELECT blocked_id FROM blocked WHERE user_id = ${me.id}`
		// );
		// for (let i = 0; i < tmp.rowCount; i++)
		// 	if (tmp.rows[i].blocked_id === friend_id) // changed == to ===
		// 		return await this.unblock(me, friend_id);

		// added const here
		const tmp = await this.pool.query(
			`SELECT name FROM chat_user WHERE id= ${friend_id}`
		);
		if (!tmp.rowCount) {
			throw new BadRequestException("user does not exist");
		}

		const username: string = tmp.rows[0].name;
		await this.pool.query(
			`INSERT INTO room(name) VALUES('${me.username}-${username}');`
		);
		let new_room = await this.pool.query(
			`SELECT id from room WHERE name = '${me.username}-${username}'`
		);
		let new_room_id	= new_room.rows[0].id;
		await this.pool.query(
			`INSERT INTO participants (user_id, room_id) VALUES(${me.id}, ${new_room_id})`
		);
		await this.pool.query(
			`INSERT INTO participants (user_id, room_id) VALUES(${friend_id}, ${new_room_id})`
		);
		return (new_room_id);
	}

	async rm_dm_room(me: Session, friend_id: number) {
		// let tmp = await this.pool.query(
		// 	`SELECT room_id FROM participants
		// 	WHERE room_id in (SELECT room_id FROM participants WHERE user_id = ${friend_id})
		// 	AND user_id =${me.id} AND room_id NOT IN (SELECT id FROM room WHERE NOT owner=0)`
		// );
		const friend_room = await this.get_dm_room(me, friend_id);
		if (!friend_room)
		// if (!tmp.rowCount)
			return console.log(`no conversation between ${me.id} and ${friend_id} in rm_friend`);
		// let friend_room = tmp.rows[0].room_id;
		await this.pool.query(`DELETE FROM message WHERE room_id= ${friend_room}`);
		await this.pool.query(`DELETE FROM participants WHERE room_id = ${friend_room}`);
		await this.pool.query(`DELETE FROM room WHERE id= ${friend_room}`);
	}

	async create_group(me: Session, group: GroupConfig) {
		try {
			await this.pool.query(`
				INSERT INTO room (name, owner, private, password, activity)
				VALUES('${group.name}', ${me.id}, ${group.private}, crypt('${group.password}', gen_salt('bf')), NOW())`
			);
		}
		catch {
			throw new BadRequestException('group name already exists');
		}
		let tmp = await this.pool.query(`SELECT id FROM room WHERE name='${group.name}'`);
		let room_id = tmp.rows[0].id;
		// for (i = 0; i < group.participants.length; i++)
		await this.pool.query(`INSERT INTO participants(user_id, room_id) VALUES(${me.id}, ${room_id})`);
	}

	async get_role(id: number, room_id: number) {
		let tmp = await this.pool.query(`SELECT owner FROM room WHERE id=${room_id}`);
		if (tmp.rows[0].owner == id)
			return OWNER;
		tmp = await this.pool.query(`SELECT user_id FROM admins WHERE room_id=${room_id}`);
		{
			for (let i = 0; i < tmp.rowCount; i++)
				if (tmp.rows[i].user_id == id)
					return ADMIN;
		}
		tmp = await this.pool.query(`SELECT user_id FROM participants WHERE room_id=${room_id}`);
		{
			for (let i = 0; i < tmp.rowCount; i++)
				if (tmp.rows[i].user_id == id)
					return PARTICIPANT;
		}
		return -1;
	}

	// todo: review this function
	async addGroupUser(me: Session, room_id: number, user_id: number) {
		const participants = await this.getRoomParcipants(room_id);
		if (participants.includes(user_id))
			throw new BadRequestException("user is already in the room");

		let tmp = await this.pool.query(`
			SELECT role, banned_id FROM banned
			WHERE room_id=${room_id} AND banned_id=${user_id}`
		);
		if (tmp.rowCount) // changed == to ===
		{
			let role1 = await this.get_role(me.id, room_id);
			let role2 = tmp.rows[0].role;
			// wtf is going on here?
			if (role1 < role2 /* && role1 >= ADMIN */)  //option for who can invite into group
				throw new ForbiddenException("not enough rights");
		}
			await this.pool.query(`
				INSERT INTO participants(user_id, room_id)
				VALUES(${user_id}, ${room_id})`);
	}

	async send_group_msg(me: Session, room_id: number, message: string) {
		let tmp = await this.pool.query(
			`SELECT banned_id, unban FROM banned WHERE room_id= ${room_id}
			AND mute=true AND banned_id=${me.id}`
		);
		let now = await this.pool.query(`SELECT NOW()`);
		if (tmp.rowCount)
		{
			if (tmp.rows[0].unban < now.rows[0].now)
				await this.pool.query(`
					DELETE FROM banned WHERE banned_id=${me.id}
					AND mute=true AND room_id=${room_id}`
				);
			else
				throw new ForbiddenException("you are muted");
				// return ("you are still muted");
		}
		await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${me.id}, NOW(), '${message}', ${room_id})`
		);
		await this.pool.query(`
			UPDATE room SET activity=NOW() WHERE id=${room_id}`);
	}

	async getRoomsList() {
		const query = await this.pool.query(`
			SELECT id FROM room
			WHERE owner IS NOT NULL;
		`);
		const rooms = [];
		for (let i = 0; i < query.rowCount; ++i)
			rooms.push(query.rows[i].id);
		return rooms;
	}

	async rm_group(me: Session, room_id: number) {
		if (await this.get_role(me.id, room_id) != OWNER)
			throw new ForbiddenException("you must be the group owner to remove it");
			
		await this.pool.query(`DELETE FROM message WHERE room_id=${room_id}`);
		await this.pool.query(`DELETE FROM participants WHERE room_id=${room_id}`);
		await this.pool.query(`DELETE FROM admins WHERE room_id=${room_id}`);
		await this.pool.query(`DELETE FROM banned WHERE room_id=${room_id}`);
		await this.pool.query(`DELETE FROM room WHERE id=${room_id}`);
	}

}
