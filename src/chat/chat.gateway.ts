import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { parse } from 'cookie';
import { WebSocket } from 'ws';
import { ValidateRoomPipe, ValidateRoomPipeWS } from './pipes/validate_room.pipe';
import { ParseIntPipe, UseFilters, UseGuards } from '@nestjs/common';
import { WsExceptionFilter } from './exception-filters/wsexception';
import { ChatService } from './chat.service';
import { RoomGuard } from './guards/participant.guard';
import { WsAuthService } from './ws-auth.service';

@WebSocketGateway({ path: '/chat' })
@UseFilters(WsExceptionFilter)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

    constructor (
		private chatService: ChatService,
		private wsAuthService: WsAuthService
	) {
	}

	// // throws exception if verify fails
	// getUserFromUpgradeRequest(req: IncomingMessage) {
	// 	const token = parse(req.headers.cookie)['jwt_token'];
	// 	const user = this.jwtService.verify(token);
	// 	return (user);
	// }

	// getUserFromSocket(socket: WebSocket) {
	// 	for (let [key, value] of this.connected_users.entries()) {
	// 		if (value === socket) 
	// 			return key;
	// 	}
	// }

    handleConnection(client: WebSocket, req: IncomingMessage) {
    	let user: {id: number, username: string};
		try {
			user = this.wsAuthService.getUserFromUpgradeRequest(req);
		} catch (error) {
			client.close(1008, 'bad credentials');
			return;
		}
		if (this.wsAuthService.connected_users.has(user.id)) {
			client.close(1008, 'user already connected via another socket');
			return;
		}

		this.wsAuthService.connected_users.set(user.id, client);
		console.log(`user ${user.id} (${user.username}) is connected.`);
		// console.log(this.wsAuthService.getConnectedUsersIDs()); 
	}

	handleDisconnect(client: WebSocket) {
		const id = this.wsAuthService.getUserFromSocket(client);
		// remove entry from map
		this.wsAuthService.connected_users.delete(id);
		console.log(`user ${id} disconnected.`);
		// console.log(this.wsAuthService.getConnectedUsersIDs()); 
	}

	// @SubscribeMessage('message')
	// handleMessage(client: WebSocket, payload: string): string {
	// 	const user_id = this.wsAuthService.getUserFromSocket(client);
	// 	console.log(`Message received from ${user_id}:`);
	// 	console.log(payload);
	// 	console.log(typeof payload);

	// 	return 'Got your message!';
	// }

	broadcast_to_list(users: number[], event: string, data: any) {
		const payload = {event, data};
		for (const user of users) {
			if (this.wsAuthService.connected_users.has(user)) {
				this.wsAuthService.connected_users.get(user).send(JSON.stringify(payload));
			}
		}
	}

	@UseGuards(RoomGuard)
	@SubscribeMessage('message_to_room')
	async postMsgToRoom(
		@ConnectedSocket() socket: WebSocket,
		@MessageBody('room_id', ParseIntPipe) room_id: number,
		@MessageBody('message') message: string
	) {
		const user_id = this.wsAuthService.getUserFromSocket(socket);
		this.chatService.send_msg_to_room_ws(user_id, room_id, message);

		// broadcast to room participants that are online
		this.broadcast_to_list(
			await this.chatService.getRoomParcipants(room_id),
			'new message',
			{room_id, user_id, message}
		)
		return 'OK';
	}



	// sendMsgToConnectedUser(user_id: number, message: string) {
	// 	const socket = this.wsAuthService.connected_users.get(user_id);
	// 	if (socket) 
	// 		socket.send(message);
	// }
}
