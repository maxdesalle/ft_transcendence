import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { Conversation, Session } from './DTO/chat-user.dto';

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
		let my_query;
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

	async send_dm(me: Session, message: string) {
		await this.pool.query(`INSERT INTO message(user_id, timestamp, message, room_id) VALUES(${me.id}, NOW(), '${message}', ${me.selected_room})`)
	}

	// populates Session.blocked with users ids
	async get_blocked(me: Session) {
		let my_query = await this.pool.query(
			`SELECT blocked_id FROM blocked WHERE user_id=${me.id}
			UNION SELECT user_id FROM blocked WHERE blocked_id=${me.id}`
		);
		me.blocked = [];
		for (let i = 0; i < my_query.rowCount; i++)
			me.blocked.push(my_query.rows[i].blocked_id);
	}

	async block(me: Session, block_id: number) {
		await this.pool.query(
			`INSERT INTO blocked(user_id, blocked_id)
			VALUES(${me.id}, ${block_id})`
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

	// populates Session.conversations
	async  get_convs(me: Session) {
		await this.get_blocked(me);
		let room_query = await this.pool.query(
			`SELECT id, name, owner FROM room
			WHERE id IN (SELECT room_id FROM participants WHERE user_id = ${me.id})
			ORDER BY activity DESC`
		);
		me.conversations = [];
		for (let i = 0; i < room_query.rowCount; i++) //for every conversation
		{
			let room_row = room_query.rows[i];
			let room_id = room_row.id;
			let part_q = await this.pool.query(`
				SELECT user_id FROM participants
				WHERE room_id = ${room_row.id}`
			);
			if (!room_row.owner && (me.blocked.includes(part_q.rows[0].user_id) || me.blocked.includes(part_q.rows[1].user_id)))
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
			me.conversations.push(tmp);
		}
	}

	// this function might duplicate direct message rooms
	// see rm_friends
	async add_friend(me: Session, friend_id: number) {
		let tmp = await this.pool.query(
			`SELECT blocked_id FROM blocked WHERE user_id = ${me.id}`
		);
		for (let i = 0; i < tmp.rowCount; i++)
			if (tmp.rows[i].blocked_id === friend_id) // chaged == to ===
				return await this.unblock(me, friend_id);
		tmp = await this.pool.query(
			`SELECT name FROM chat_user WHERE id= ${friend_id}`
		);
		if (!tmp.rowCount)
			return;
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
	}

	async rm_friend(me: Session, friend_id: number) {
		let tmp = await this.pool.query(
			`SELECT room_id FROM participants
			WHERE room_id in (SELECT room_id FROM participants WHERE user_id = ${friend_id})
			AND user_id =${me.id} AND room_id NOT IN (SELECT id FROM room WHERE NOT owner=0)`
		);
		if (!tmp.rowCount)
			return console.log(`no conversation between ${me.id} and ${friend_id} in rm_friend`);
		let friend_room = tmp.rows[0].room_id;
		await this.pool.query(`DELETE FROM message WHERE room_id= ${friend_room}`);
		await this.pool.query(`DELETE FROM participants WHERE room_id = ${friend_room}`);
		await this.pool.query(`DELETE FROM room WHERE id= ${friend_room}`);
	}

}
