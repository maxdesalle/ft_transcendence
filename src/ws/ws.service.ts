import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IncomingMessage } from "http";
import { parse } from 'cookie';
import { WebSocket } from "ws";
import { FriendsService } from "src/friends/friends.service";


 @Injectable()
 export class WsService {

	static connected_users = new Map<number, WebSocket>();

    constructor (
		private jwtService: JwtService,
		@Inject(forwardRef(() => FriendsService))
		private friendsService: FriendsService
	) {}

	// throws exception if verify fails
	getUserFromUpgradeRequest(req: IncomingMessage) {
		const token = parse(req.headers.cookie)['jwt_token'];
		const user = this.jwtService.verify(token);
		return (user);
	}

	getUserFromSocket(socket: WebSocket) {
		for (let [key, value] of WsService.connected_users.entries()) {
			if (value === socket) 
				return key;
		}
	}

	getConnectedUsersIDs() {
		const list: number[] = [];
		for (const key of WsService.connected_users.keys())
			list.push(key);
		return list;
	}

	isUserConnected(user_id: number): boolean {
		return WsService.connected_users.has(user_id);
	}

	setUserOnline(user_id: number, socket: WebSocket) {
		WsService.connected_users.set(user_id, socket);
	}

	setUserOffline(user_id: number) {
		return WsService.connected_users.delete(user_id);
	}

	sendMsgToUser(user_id: number, data: any) {
		if (WsService.connected_users.has(user_id))
			WsService.connected_users.get(user_id)
			.send(JSON.stringify(data));
	}
	
	sendMsgToUsersList(users: number[], data: any) {
		for (const user_id of users) {
			this.sendMsgToUser(user_id, data);
		}
	}

	async notifyStatusChangeToFriends(user_id: number, status: string) {
		const friends = await this.friendsService.listFriendsIDs(user_id);
		this.sendMsgToUsersList(friends, {
			event: `status: friend_${status}`,
			user_id
		});
	}
 }