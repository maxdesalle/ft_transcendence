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
}
