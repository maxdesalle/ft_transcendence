import { JwtService } from '@nestjs/jwt';
import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { parse } from 'cookie';
import { WebSocket } from 'ws';
import { ValidateRoomPipe, ValidateRoomPipeWS } from './pipes/validate_room.pipe';
import { UseFilters } from '@nestjs/common';
import { WsExceptionFilter } from './exception-filters/wsexception';
import { ChatService } from './chat.service';

@WebSocketGateway({ path: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

	connected_users: Map<number, WebSocket>;

    constructor (
		private jwtService: JwtService,
		private chatService: ChatService
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

    handleConnection(client: WebSocket, req: IncomingMessage) {
    	let user: {id: number, username: string};
		try {
			user = this.getUserFromUpgradeRequest(req);
			console.log(`user ${user.id} (${user.username}) is connected.`);
			client.send("Welcome!");
			// add to map
			this.connected_users.set(user.id, client);
			// this.connected_users.push({ // consider using a map
				// id: user.id,
				// socket: client
			// });
		} catch (error) {
			// client.send('bad credentials');
			// client.terminate();
			client.close(1008, 'bad credentials');

			// console.log(error);
		}
		// console.log(this.connected_users.keys());
	}

	handleDisconnect(client: WebSocket) {
		const id = this.getUserFromSocket(client);
		// remove entry from map
		this.connected_users.delete(id);
		// console.log(this.connected_users.keys());
	}

	@SubscribeMessage('message')
	handleMessage(client: WebSocket, payload: string): string {
		const user_id = this.getUserFromSocket(client);
		console.log(`Message received from ${user_id}:`);
		console.log(payload);
		console.log(typeof payload);

		return 'Got your message!';
	}


	@UseFilters(WsExceptionFilter)
	@SubscribeMessage('message_to_room')
	async postMsgToRoom(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('room_id', ValidateRoomPipeWS) room_id: number,
		@MessageBody('message') message: string
	) {
		const user_id = this.getUserFromSocket(socket);
		this.chatService.send_msg_to_room_ws(user_id, room_id, message);

		// broadcast to room participants that are online
		for (const user of await this.chatService.getRoomParcipants(room_id)) {
			if (this.connected_users.has(user))
				this.connected_users.get(user).send(JSON.stringify({
					event: 'new_message',
					room_id,
					user_id,
					message,
				}));
		}
		return 'OK';
	}

	getConnectedUsersIDs() {
		const list: number[] = [];
		for (const key of this.connected_users.keys())
			list.push(key);
		return list;
	}

	sendMsgToConnectedUser(user_id: number, message: string) {
		const socket = this.connected_users.get(user_id);
		if (socket) 
			socket.send(message);
	}
}
