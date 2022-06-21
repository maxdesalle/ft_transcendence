/// <reference types="node" />
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { WsService } from './ws.service';
export declare class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private wsService;
    constructor(wsService: WsService);
    handleConnection(client: WebSocket, req: IncomingMessage): void;
    handleDisconnect(client: WebSocket): void;
}
