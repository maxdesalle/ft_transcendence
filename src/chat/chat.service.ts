import { Injectable } from '@nestjs/common';
import { Connection, EntityManager } from 'typeorm';
import { Session } from './DTO/chat-user.dto';

@Injectable()
export class ChatService {
	pool: EntityManager;

	constructor(private connection: Connection) {
		this.pool = connection.manager;
	}

	// sets Session.selected_room to id
	// if msg == true, populates Session.messages with new messages
	async on_select(me: Session, id: number, msg: boolean) {
		me.selected_room = id;
		me.messages = [];
		if (msg)
			await this.get_message(me);
	}

	// populates Session.messages with new messages
	async get_message(me: Session) {
		let last_time;
		let my_query;
		if (me.messages.length > 0)
		{
			last_time = new Date(me.messages[0].timestamp).getTime() / 1000;
			my_query = await this.pool.query(`SELECT id, user_id, message, timestamp FROM message WHERE room_id = ${me.selected_room} AND timestamp > to_timestamp(${last_time}) AND user_id NOT IN (SELECT blocked_id FROM blocked WHERE user_id= ${me.id}) ORDER BY timestamp DESC`);
		}
		else
			my_query = await this.pool.query(`SELECT id, user_id, message, timestamp FROM message WHERE room_id = ${me.selected_room} AND user_id NOT IN (SELECT blocked_id FROM blocked WHERE user_id= ${me.id}) ORDER BY timestamp DESC`);
		for (let i = 0; i < my_query.rowCount; i++)
			me.messages.push(my_query.rows[i]);
	}

}
