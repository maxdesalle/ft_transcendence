import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class ChatService {
	constructor(
		private connection: Connection,
	) {}

	async testDBconnection() {
		const manager = this.connection.manager;

		const result = await manager.query("SELECT * FROM chat_user;");
		console.log(result);
		return(result);
	}

	async userExists(username: string): Promise<boolean> {
		const manager = this.connection.manager;
		const search: Array<any> = await manager.createQueryBuilder()
			.select()
			.from("chat_user", "")
			.where("name = :x", {x: username})
			.execute();
		if (search.length)
			return (true);
		return (false);
	}

	async createChatUser(username: string) {
		if (await this.userExists(username))
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
