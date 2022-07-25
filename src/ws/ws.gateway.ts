import {  OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { WsService } from './ws.service';

@WebSocketGateway()
// @UseFilters(WsExceptionFilter)
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect{

    constructor (
		private wsService: WsService
	) {}

    handleConnection(client: WebSocket, req: IncomingMessage) {
		// authenticate user
    	let user: {id: number, login42: string};
		try {
			user = this.wsService.getUserFromUpgradeRequest(req);
		} catch (error) {
			client.send('Authentication KO. Gimme a valid JWT!');
			client.close(1008, 'Bad credentials');
			return;
		}
		// avoid duplicate connection for same user
		if (this.wsService.isUserOnline(user.id)) {
			client.close(1008, 'user already connected via another socket');
			return;
		}

		// add to map of connected users
		this.wsService.setUserOnline(user.id, client);
		// log client and server side
		console.log(`user ${user.id} (${user.login42}) is connected.`);
		client.send(`Authentication OK. user_id: ${user.id}, login42: ${user.login42}`);
		// notify state change to friends
		this.wsService.notifyStatusChangeToFriends(user.id, 'online');
	}

	handleDisconnect(client: WebSocket) {
		const user_id = this.wsService.getUserFromSocket(client);
		// remove entry from map
		if (this.wsService.setUserOffline(user_id)) {
			console.log(`user ${user_id} disconnected.`);
			this.wsService.notifyStatusChangeToFriends(user_id, 'offline');
		}
	}
}
