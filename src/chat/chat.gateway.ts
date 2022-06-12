import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WsException } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { parse } from 'cookie';
import { WebSocket } from 'ws';

@WebSocketGateway({ path: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

	connected_users:{id: number, socket: WebSocket}[];

    constructor (private jwtService: JwtService) {
		this.connected_users = [];
	}

	// throws exception if verify fails
	getUserFromUpgradeRequest(req: IncomingMessage) {
		const token = parse(req.headers.cookie)['jwt_token'];
		const user = this.jwtService.verify(token);
		return (user);
	}

	getUserFromSocket(socket: WebSocket) {
		const res = this.connected_users.find(value => value.socket === socket);
		if (!res)
			return null;
		return res.id;
	}

    handleConnection(client: WebSocket, req: IncomingMessage) {
    	let user: {id: number, username: string};
		try {
			user = this.getUserFromUpgradeRequest(req);
			console.log(`user ${user.id} (${user.username}) is connected.`);
			client.send("Welcome!");
			this.connected_users.push({ // consider using a map
				id: user.id,
				socket: client
			});
		} catch (error) {
			client.send('bad credentials');
			client.terminate();
			// console.log(error);
		}
		// console.log(this.connected_users);
	}

	handleDisconnect(client: WebSocket) {
		// debug (inefficient!)
		// console.log(`user ${this.getUserFromSocket(client)} disconnected`);

		// remove entry from array
		this.connected_users = this.connected_users
									.filter(value => value.socket !== client);

		// console.log(this.connected_users);
	}

	@SubscribeMessage('message')
	handleMessage(client: WebSocket, payload: any): string {
		const user_id = this.getUserFromSocket(client);
		console.log(`Message received from ${user_id}:`);
		console.log(payload);

		return 'Got your message!';
	}

	getSocketByUserId(user_id: number) {
		for (const user of this.connected_users) {
			if (user_id === user.id)
				return user.socket;
		}
		return null;
	}
	
	sendMsgToConnectedUser(user_id: number, message: string) {
		const socket = this.getSocketByUserId(user_id);
		if (socket) 
			socket.send(message);
	}
}
