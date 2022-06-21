/// <reference types="node" />
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket, WebSocketServer as WSS } from 'ws';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { WsService } from 'src/ws/ws.service';
export declare const playing: Set<number>;
export declare class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private usersService;
    private wsService;
    constructor(jwtService: JwtService, usersService: UsersService, wsService: WsService);
    handleConnection(ws: WebSocket, req: IncomingMessage): void;
    handleDisconnect(client: WebSocket): void;
    playAgainstAnyone(client: WebSocket, data: string): void;
    invitePlayer(client: WebSocket, data: string): Promise<void>;
    acceptInvitation(client: WebSocket, data: string): void;
    matchPlayers(p1Socket: WebSocket, p2Socket: WebSocket): void;
}
export declare class PongViewerGateway implements OnGatewayInit {
    afterInit(wss: WSS): void;
}
