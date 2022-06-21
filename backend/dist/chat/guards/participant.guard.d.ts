import { CanActivate, ExecutionContext } from "@nestjs/common";
import { ChatService } from "../chat.service";
import { WsService } from "../../ws/ws.service";
export declare class IsParticipant implements CanActivate {
    private chatService;
    constructor(chatService: ChatService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
export declare class RoomGuard implements CanActivate {
    private chatService;
    private wsAuthService;
    constructor(chatService: ChatService, wsAuthService: WsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
