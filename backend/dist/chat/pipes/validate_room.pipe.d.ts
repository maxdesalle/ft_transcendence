import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { ChatService } from "../chat.service";
export declare class ValidateRoomPipe implements PipeTransform {
    private chatService;
    constructor(chatService: ChatService);
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
}
export declare class ValidGroupRoomPipe implements PipeTransform {
    private chatService;
    constructor(chatService: ChatService);
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
}
