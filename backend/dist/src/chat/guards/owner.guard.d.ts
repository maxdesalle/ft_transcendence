import { CanActivate, ExecutionContext } from "@nestjs/common";
import { ChatService } from "../chat.service";
export declare class GroupOwnerGuard implements CanActivate {
    private chatService;
    constructor(chatService: ChatService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
