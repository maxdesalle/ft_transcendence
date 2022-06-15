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
		if (this.wsAuthService.connected_users.delete(id))
			console.log(`user ${id} disconnected.`);
		// console.log(this.wsAuthService.getConnectedUsersIDs()); 
	}

	@SubscribeMessage('message')
	handleMessage(client: WebSocket, payload: string){
		console.log(`Message received`);
		console.log(payload);
		const pl = {
			event: 'party',
			what: 'pool party',
			where: 'pool'
		}
		client.send(JSON.stringify(pl));

		// return 'Got your message!';
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
		this.sendMsgToUsersList(
			await this.chatService.getRoomParcipants(room_id),
			{room_id, user_id, message}
		)
		return 'OK';
	}



	sendMsgToUser(user_id: number, data: any) {
		if (this.wsAuthService.connected_users.has(user_id))
			this.wsAuthService.connected_users.get(user_id)
			.send(JSON.stringify(data));
	}
	
	sendMsgToUsersList(users: number[], data: any) {
		for (const user_id of users) {
			this.sendMsgToUser(user_id, data);
		}
	}


}
