import { OnGatewayConnection, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { WebSocket } from 'ws';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection{

  handleConnection(client: WebSocket, ...args: any[]) {
    console.log('a new client connected');
    
  }

  // @SubscribeMessage('message')
  // handleMessage(client: any, payload: any): string {
  //   return 'Hello world!';
  // }
}
