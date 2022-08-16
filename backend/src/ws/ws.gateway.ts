import {  OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { WsService } from './ws.service';

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect{

    constructor (
		private wsService: WsService
	) {}

	async handleConnection(client: WebSocket, req: IncomingMessage) {
		// authenticate user
    	let user: {id: number, login42: string};
		try {
			user = await this.wsService.authenticateUser(req);
		} catch (error) {
			client.send(JSON.stringify({
				event: "ws_auth_fail",
				error: error
			}));
			client.close(1008, 'Bad credentials');
			console.log('Authentication to Notifications wss failed');
			return;
		}
		// avoid duplicate connection for same user
		if (this.wsService.isUserOnline(user.id)) {
			client.send(JSON.stringify({
				event: "ws_auth_fail",
				reason: "already connected"
			}));
			client.close(1008, 'user already connected via another socket');
			return;
		}

		// add to map of connected users
		this.wsService.setUserOnline(user.id, client);
		// log client and server side
		console.log(`user ${user.id} (${user.login42}) is connected.`);
		client.send(JSON.stringify({
			event: "ws_auth_success",
		}));
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
