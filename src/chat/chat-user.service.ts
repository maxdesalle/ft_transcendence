import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class ChatUserService {
	constructor(
		private connection: Connection,
	) {}

	async getAll() {
		const manager = this.connection.manager;

		return await manager.query("SELECT * FROM chat_user;");
	}

	// return user object or NULL
	async getUser(username: string) {
		const manager = this.connection.manager;
		const search: Array<any> = await manager.createQueryBuilder()
			.select("")
			.from("chat_user", "")
			.where("name = :x", {x: username})
			.execute();
		if (search.length)
			return (search[0]);
		return (null);
	}

	async createChatUser(username: string) {
		if (await this.getUser(username))
			return "User already exists"

		const manager = this.connection.manager;
		await manager.createQueryBuilder()
			.insert()
			.into("chat_user")
			.values({
				name: username,
				status: true
			})
			.execute();

		return `User ${username} was created`;
	}

}
