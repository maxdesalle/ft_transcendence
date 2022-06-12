import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { parse } from 'cookie';
import { WebSocket } from 'ws';

@WebSocketGateway({ path: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

	connected_users: Map<number, WebSocket>;

    constructor (private jwtService: JwtService) {
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
	handleMessage(client: WebSocket, payload: any): string {
		const user_id = this.getUserFromSocket(client);
		console.log(`Message received from ${user_id}:`);
		console.log(payload);

		return 'Got your message!';
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
