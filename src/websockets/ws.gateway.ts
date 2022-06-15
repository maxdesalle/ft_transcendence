import { BaseWsExceptionFilter, ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { ValidateRoomPipe, ValidateRoomPipeWS } from '../chat/pipes/validate_room.pipe';
import { ParseIntPipe, UseFilters, UseGuards } from '@nestjs/common';
import { WsExceptionFilter } from '../chat/exception-filters/wsexception';
import { WsService } from './ws.service';

@WebSocketGateway()
// @UseFilters(WsExceptionFilter)
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect{

    constructor (
		private wsService: WsService
	) {}

	// authenticate user
    handleConnection(client: WebSocket, req: IncomingMessage) {
    	let user: {id: number, username: string};
		try {
			user = this.wsService.getUserFromUpgradeRequest(req);
		} catch (error) {
			client.close(1008, 'bad credentials');
			return;
		}
		if (this.wsService.connected_users.has(user.id)) {
			client.close(1008, 'user already connected via another socket');
			return;
		}

		this.wsService.connected_users.set(user.id, client);
		console.log(`user ${user.id} (${user.username}) is connected.`);
	}

	handleDisconnect(client: WebSocket) {
		const id = this.wsService.getUserFromSocket(client);
		// remove entry from map
		if (this.wsService.connected_users.delete(id))
			console.log(`user ${id} disconnected.`);
		// console.log(this.wsAuthService.getConnectedUsersIDs()); 
	}

	// @SubscribeMessage('message')
	// handleMessage(client: WebSocket, payload: string){
	// 	console.log(`Message received`);
	// 	console.log(payload);
	// 	const pl = {
	// 		event: 'party',
	// 		what: 'pool party',
	// 		where: 'pool'
	// 	}
	// 	client.send(JSON.stringify(pl));

		// return 'Got your message!';
	// }

}
