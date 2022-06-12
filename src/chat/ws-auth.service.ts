import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IncomingMessage } from "http";
import { ChatService } from "./chat.service";
import { parse } from 'cookie';
import { WebSocket } from "ws";


 @Injectable()
 export class WsAuthService {

	public connected_users: Map<number, WebSocket>;

    constructor (
		private jwtService: JwtService,
		// private chatService: ChatService
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


 }