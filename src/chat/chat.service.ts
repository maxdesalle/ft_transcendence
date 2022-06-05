import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { Session } from './DTO/chat-user.dto';

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

}
