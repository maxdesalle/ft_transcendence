/// <reference types="node" />
import { JwtService } from "@nestjs/jwt";
import { IncomingMessage } from "http";
import { WebSocket } from "ws";
import { FriendsService } from "src/friends/friends.service";
export declare class WsService {
    private jwtService;
    private friendsService;
    static connected_users: Map<number, WebSocket>;
    constructor(jwtService: JwtService, friendsService: FriendsService);
    getUserFromUpgradeRequest(req: IncomingMessage): any;
    getUserFromSocket(socket: WebSocket): number;
    getConnectedUsersIDs(): number[];
    isUserOnline(user_id: number): boolean;
    setUserOnline(user_id: number, socket: WebSocket): void;
    setUserOffline(user_id: number): boolean;
    sendMsgToUser(user_id: number, data: any): void;
    sendMsgToUsersList(users: number[], data: any): void;
    sendMsgToAll(data: any): void;
    notifyStatusChangeToFriends(user_id: number, status: string): Promise<void>;
    notifyStatusToFriendsAuto(user_id: number): Promise<void>;
}
