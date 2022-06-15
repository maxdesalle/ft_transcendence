import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IncomingMessage } from "http";
import { parse } from 'cookie';
import { WebSocket } from "ws";


 @Injectable()
 export class WsService {

	public connected_users: Map<number, WebSocket>;

    constructor (
		private jwtService: JwtService,
	) {
		this.connected_users = new Map<number, WebSocket>();
	}

	// throws exception if verify fails
	getUserFromUpgradeRequest(req: IncomingMessage) {
		const token = parse(req.headers.cookie)['jwt_token'];
		const user = this.jwtService.verify(token);
		return (user);
	}

	getUserFromSocket(socket: WebSocket) {
		for (let [key, value] of this.connected_users.entries()) {
			if (value === socket) 
				return key;
		}
	}

	getConnectedUsersIDs() {
		const list: number[] = [];
		for (const key of this.connected_users.keys())
			list.push(key);
		return list;
	}

	isUserConnected(user_id: number): boolean {
		return this.connected_users.has(user_id);
	}

	sendMsgToUser(user_id: number, data: any) {
		if (this.connected_users.has(user_id))
			this.connected_users.get(user_id)
			.send(JSON.stringify(data));
	}
	
	sendMsgToUsersList(users: number[], data: any) {
		for (const user_id of users) {
			this.sendMsgToUser(user_id, data);
		}
	}
 }