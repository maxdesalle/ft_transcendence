import { BadRequestException, ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Connection, EntityManager } from 'typeorm';
import { Conversation, Session } from './DTO/chat-user.dto';
import { GroupConfig, Message } from './DTO/chat.dto';

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

	constructor(
		private connection: Connection,
		private usersService: UsersService
		) {
		this.pool = new queryAdaptor(connection.manager);
	}
	
	async sendDMtoUser(me: User, toId: number, msg: string) {
		if (me.id === toId)
			throw new BadRequestException("You shall not talk to yourself");
		// check if room exists
		let room_id = await this.get_dm_room(me, toId);
		// create room if necessary
		// console.log(room_id);
		if (!room_id) 
			room_id = await this.create_dm_room(me, toId);
		// insert message into table	
		// await this.pool.query(`
		// 	INSERT INTO message(user_id, timestamp, message, room_id)
		// 	VALUES(${me.id}, NOW(), '${msg}', ${room_id})`
		// );
		// return room_id;
		return this.send_msg_to_room(me, room_id, msg);
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

	// returns id of created room 
	async create_dm_room(me: Session, friend_id: number) {
		// this has apparently something to do with unblocking someone if
		// you decide to send him a DM
		// let tmp = await this.pool.query(
		// 	`SELECT blocked_id FROM blocked WHERE user_id = ${me.id}`
		// );
		// for (let i = 0; i < tmp.rowCount; i++)
		// 	if (tmp.rows[i].blocked_id === friend_id) // changed == to ===
		// 		return await this.unblock(me, friend_id);

		// get username
		const tmp = await this.pool.query(
			`SELECT login42 FROM public.user WHERE id= ${friend_id}`
		);
		if (!tmp.rowCount) {
			throw new BadRequestException("user does not exist");
		}
		const login42: string = tmp.rows[0].login42;

		// create room
		const query = await this.pool.query(
			`INSERT INTO room(name) VALUES('${me.login42}-${login42}')
			RETURNING id;`
		);
		// let new_room = await this.pool.query(
		// 	`SELECT id from room WHERE name = '${me.username}-${username}'`
		// );
		// let new_room_id	= new_room.rows[0].id;
		let new_room_id	= query.rows[0].id;
		await this.pool.query(
			`INSERT INTO participants (user_id, room_id)
			VALUES(${me.id}, ${new_room_id})`
		);
		await this.pool.query(
			`INSERT INTO participants (user_id, room_id)
			VALUES(${friend_id}, ${new_room_id})`
		);
		return (new_room_id);
	}

	async getDMbyUser(me: User, friend_id: number) {
		if (me.id === friend_id)
			throw new BadRequestException("No talking to yourself, plz...")
		const room_id = await this.get_dm_room(me, friend_id);
		if (!room_id)
			return [];
		return this.getMessagesByRoomId(me, room_id);
	}


	// TODO: review this: being blocked might not have anything to do with rooms? 
	// or will be this used to fetch DM rooms too?
	async getMessagesByRoomId(me: User, room_id: number) {
		// const my_query = await this.pool.query(
		// 	`SELECT id, user_id, message, timestamp FROM message
		// 	WHERE room_id = ${room_id}
		// 	AND user_id NOT IN (SELECT blocked_id FROM blocked WHERE user_id= ${me.id})
		// 	ORDER BY timestamp DESC`
		// );
		const my_query = await this.pool.query(`
			SELECT message.id, user_id, login42, display_name, message, timestamp
			FROM message
			JOIN public.user ON message.user_id=public.user.id
			WHERE room_id=${room_id};`
		)
		return my_query.rows;
	}

	async send_dm(me: Session, message: string) {
		await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${me.id}, NOW(), '${message}', ${me.selected_room})`);
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

	async getRoomParcipants(room_id: number): Promise<number[]> {
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
	async  get_convs(me: User) {
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
			// let my_status = await this.pool.query(`
				// SELECT status FROM public.user WHERE id= ${part_q.rows[0].user_id}`
			// );
			// let tmp = new Conversation(room_id, room_row.name, my_status.rows[0].status);
			const type = room_row.owner ? 'group':'DM'
			let tmp = new Conversation(room_id, room_row.name, type);
			// tmp.id		= room_id;
			// tmp.name	= room_row.name;
			// tmp.status	= my_status.rows[0].status;
			for (let n = 0; n < part_q.rowCount; n++) //get all participants of a given conversation
				tmp.participants.push(part_q.rows[n].user_id);
			conversations.push(tmp);
		}
		return conversations;
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

	async groupNameExists(group_name: string) {
		const query = await this.pool.query(`
			SELECT * FROM room
			WHERE name = '${group_name}';`);
		return !!query.rowCount;
	}

	async create_group(me: Session, group: GroupConfig) {
		if (await this.groupNameExists(group.name))
			throw new BadRequestException('group name already taken');

		const query = await this.pool.query(`
			INSERT INTO room (name, owner, activity)
			VALUES('${group.name}', ${me.id}, NOW())
			RETURNING id`);

		// let tmp = await this.pool.query(`SELECT id FROM room WHERE name='${group.name}'`);
		const room_id = query.rows[0].id;
		// for (i = 0; i < group.participants.length; i++)
		await this.pool.query(`INSERT INTO participants(user_id, room_id) VALUES(${me.id}, ${room_id})`);
		if (group.password)
			await this.set_password(room_id, group.password);
		if (group.private)
			await this.set_private(room_id, group.private);
		return room_id;
	}

	async get_role(id: number, room_id: number) {
		// if (!(await this.groupExists(room_id)))
			// throw new BadRequestException("bad room_id");
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

	async send_msg_to_room_ws(user_id: number, room_id: number, message: string) {
		// todo: verify is user is banned or muted
		await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${user_id}, NOW(), '${message}', ${room_id})`
		);
		await this.pool.query(`
			UPDATE room SET activity=NOW() WHERE id=${room_id}`);
	}

	async send_msg_to_room(me: User, room_id: number, message: string) {
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
		const query = await this.pool.query(`
			INSERT INTO message(user_id, timestamp, message, room_id)
			VALUES(${me.id}, NOW(), '${message}', ${room_id})
			RETURNING *`
		);
		await this.pool.query(`
			UPDATE room SET activity=NOW() WHERE id=${room_id}`);

		const user = await this.usersService.findById(me.id);
		const msg: Message = {
			...query.rows[0],
			login42: user.login42,
			display_name: user.display_name
		}
		return msg;
	}

	async getRoomsList() {
		const query = await this.pool.query(`
			SELECT id FROM room;
		`);
		const rooms = [];
		for (let i = 0; i < query.rowCount; ++i)
			rooms.push(query.rows[i].id);
		return rooms;
	}


	async getGroupsList() {
		const query = await this.pool.query(`
			SELECT id FROM room
			WHERE owner IS NOT NULL;
		`);
		const rooms = [];
		for (let i = 0; i < query.rowCount; ++i)
			rooms.push(query.rows[i].id);
		return rooms;
	}

	async groupExists(room_id: number) {
		const rooms = this.getGroupsList();
		return (await rooms).includes(room_id);
	}

	async rm_group(me: Session, room_id: number) {
		// if (await this.get_role(me.id, room_id) != OWNER)
			// throw new ForbiddenException("you must be the group owner to remove it");
			
		await this.pool.query(`DELETE FROM message WHERE room_id=${room_id}`);
		await this.pool.query(`DELETE FROM participants WHERE room_id=${room_id}`);
		await this.pool.query(`DELETE FROM admins WHERE room_id=${room_id}`);
		await this.pool.query(`DELETE FROM banned WHERE room_id=${room_id}`);
		await this.pool.query(`DELETE FROM room WHERE id=${room_id}`);
	}

	//needs a drop-down menu to chose length of ban, either fixed or input but then check for negatives, 0 means just kick from group
	async rm_user_group(me:Session, room_id: number, user_id: number, unban_hours: number) {
		let role1 = await this.get_role(me.id, room_id);
		let role2 = await this.get_role(user_id, room_id);
		if (role1 < ADMIN || role1 <= role2)
			throw new ForbiddenException("insufficient rights");

		let unban_date = new Date;
		if (unban_hours > 0)
			unban_date.setHours(unban_date.getHours() + unban_hours);
		// else
		// 	unban_date = "NOW()";

		// await this.pool.query(`DELETE FROM message WHERE user_id=${user_id} AND room_id=${room_id}`);	//delete messages (option)
		await this.pool.query(`DELETE FROM participants WHERE user_id=${user_id} AND room_id=${room_id}`);
		await this.pool.query(`DELETE FROM banned WHERE banned_id=${user_id} AND room_id=${room_id} AND mute=true`);
		await this.pool.query(`INSERT INTO banned (user_id, banned_id, room_id, unban, mute, role) VALUES(${me.id}, ${user_id}, ${room_id}, to_timestamp(${unban_date.getTime() / 1000}), false, ${role1})`);
	}

	async mute_user(me: Session, room_id: number, user_id: number, unban_hours: number) {
		let role1 = await this.get_role(me.id, room_id);
		let role2 = await this.get_role(user_id, room_id);
		if (role1 < ADMIN || role1 <= role2)
			throw new ForbiddenException("insufficient rights");
		
		let unban_date = new Date;
		unban_date.setHours(unban_date.getHours() + unban_hours);

		await this.pool.query(`
			INSERT INTO banned (user_id, banned_id, room_id, unban, mute, role)
			VALUES(${me.id}, ${user_id}, ${room_id}, to_timestamp(${unban_date.getTime() / 1000}), true, ${role1})`);
	}

	async unmute_user(me: Session, room_id: number, user_id: number) {
		let role1 = await this.get_role(me.id, room_id);
		let role2 = await this.get_role(user_id, room_id);
		if (role1 < ADMIN || role1 <= role2)
			throw new ForbiddenException("insufficient rights");
		await this.pool.query(`
			DELETE FROM banned
			WHERE banned_id= ${user_id}
			AND room_id= ${room_id}`);
	}

	async add_admin_group(me: Session, room_id: number, user_id: number) {
		if (await this.get_role(me.id, room_id) == OWNER)
			await this.pool.query(`
				INSERT INTO admins(user_id, room_id)
				VALUES(${user_id}, ${room_id})`);
	}
	
	async rm_admin_group(me: Session, room_id: number, user_id: number) {
		if (await this.get_role(me.id, room_id) == OWNER)
			await this.pool.query(`
				DELETE FROM admins
				WHERE user_id=${user_id}
				AND room_id=${room_id}`);
	}

	async is_muted(user_id: number, room_id: number) {
		const query = await this.pool.query(`
			SELECT * FROM banned
			WHERE room_id = ${room_id}
			AND banned_id = ${user_id}
			AND mute = true;
		`)
		if (query.rowCount)
			return true;
		return false;
	}

	async is_banned(user_id: number, room_id: number) {
		const query = await this.pool.query(`
			SELECT * FROM banned
			WHERE room_id = ${room_id}
			AND banned_id = ${user_id}
			AND mute = false;
		`)
		if (query.rowCount)
			return true;
		return false;
	}

	async leave_group(me: Session, room_id: number) {
		let participants = await this.getRoomParcipants(room_id);
		// remove "me" from participants
		participants = participants.filter((value) => value !== me.id);
		if (!participants.length)	//last person in group
		{
			await this.pool.query(`DELETE FROM admins		WHERE room_id =	${room_id}`);
			await this.pool.query(`DELETE FROM banned		WHERE room_id =	${room_id}`);
			await this.pool.query(`DELETE FROM participants	WHERE room_id =	${room_id}`);
			await this.pool.query(`DELETE FROM message		WHERE room_id =	${room_id}`);
			await this.pool.query(`DELETE FROM room			WHERE id =		${room_id}`);
			return;
		}
		if (await this.get_role(me.id, room_id) != OWNER)
		{
			await this.pool.query(`
				DELETE FROM participants
				WHERE user_id=${me.id}
				AND room_id=${room_id}`);
			return;		
		}
		for (let i = 0; i < participants.length; i++)	//first admin in the list becomes owner
		{
			if (await this.get_role(participants[i], room_id) == ADMIN)
			{
				await this.pool.query(`UPDATE room SET owner=${participants[i]} WHERE id=${room_id}`);
				await this.pool.query(`DELETE FROM admins WHERE user_id=${participants[i]} AND room_id=${room_id}`);
				await this.pool.query(`DELETE FROM participants WHERE user_id=${me.id} AND room_id=${room_id}`);
				return;
			}
		}
		//first guy in the list becomes owner
		await this.pool.query(`UPDATE room SET owner=${participants[0]} WHERE id=${room_id}`);
		await this.pool.query(`DELETE FROM participants WHERE user_id=${me.id} AND room_id=${room_id}`);
	}
	
	async set_password(room_id: number, password?: string) {
		if (!password)
			return this.pool.query(`
				UPDATE room
				SET password=NULL
				WHERE id=${room_id}`);
		await this.pool.query(`
			CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;`);

		return this.pool.query(`
			UPDATE room
			SET password=crypt('${password}', gen_salt('bf')) 
			WHERE id=${room_id}`);
	}
	
	async set_private(room_id: number, cond: boolean) { //condition true = private false = public
		return this.pool.query(`
			UPDATE room SET private=${cond}
			WHERE id=${room_id}`);
	}
	
	async set_owner(me: Session, room_id: number, user_id: number) {
		const participants = await this.getRoomParcipants(room_id);
		if (!participants.includes(user_id))
			throw new BadRequestException("user is not a participant in the room");

		await this.pool.query(`UPDATE room SET owner=${user_id} WHERE id=${room_id}`);
		await this.pool.query(`INSERT INTO admins(user_id, room_id) VALUES(${me.id}, ${room_id})`);
		await this.pool.query(`DELETE FROM admins WHERE user_id=${user_id} AND room_id=${room_id}`);
	}

	async check_password_match(room_id: number, password: string) {
		await this.pool.query(`
			CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;`);

		const query = await this.pool.query(`
			SELECT (password = crypt('${password}', password))
			AS pswmatch
			FROM room
			WHERE id = ${room_id};`);
		return query.rows[0].pswmatch;
	}

	async is_group_private(room_id: number) {
		const query = await this.pool.query(`
			SELECT private FROM room
			WHERE id = ${room_id};`);
		return query.rows[0].private;
	}

	async roomInfo(room_id: number) {
		// get users
		const userIDs = await this.getRoomParcipants(room_id);

		// get their roles
		const roles: string[] = ['participant', 'admin', 'owner'];
		const users = [];
		for (let user_id of userIDs){
			users.push({
				user_id,
				role: roles[await this.get_role(user_id, room_id)],
				// muted: await this.is_muted(user_id, room_id),
			})
		}

		// get other room info
		const query = await this.pool.query(`
			SELECT name, private, owner, password
			FROM room
			WHERE id = ${room_id};`);
		const info = query.rows[0];

		return {
			room_id: room_id,
			room_name: info.name,
			type: info.owner ? 'group':'DM',
			private: info.private,
			password_protected: !!info.password,
			users
		};
	}

	async is_group_pswd_protected(room_id: number) {
		const query = await this.pool.query(`
			SELECT (password IS NOT NULL)
			AS protected FROM room
			WHERE id = ${room_id};`);
		return query.rows[0].protected;
	}

	async join_public_group(me: Session, room_id: number, password?: string) {
		// check if private
		if (await this.is_group_private(room_id))
			throw new ForbiddenException("private group, buddy");

		// check if password protected && pswd match
		if (await this.is_group_pswd_protected(room_id) && 
			! await this.check_password_match(room_id, password)) 
			throw new ForbiddenException("bad password");

		// check if user already in group
		const participants = await this.getRoomParcipants(room_id);
		if (participants.includes(me.id))
			throw new BadRequestException("user is already in the room");

		// todo: check if banned

		await this.pool.query(`
			INSERT INTO participants(user_id, room_id)
			VALUES(${me.id}, ${room_id})`);
	}
}
