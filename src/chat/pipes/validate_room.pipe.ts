import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { ChatService } from "../chat.service";

@Injectable()
export class ValidateRoomPipe implements PipeTransform {
	constructor(private chatService: ChatService) {}

	async transform(value: any, metadata: ArgumentMetadata) {

		const rooms = await this.chatService.getRoomsList();
		if (!rooms.includes(value))
			throw new BadRequestException("invalid room_id")
		return value;
	}
}

@Injectable()
export class ValidateRoomPipeWS implements PipeTransform {
	constructor(private chatService: ChatService) {}

	async transform(value: any, metadata: ArgumentMetadata) {

		const rooms = await this.chatService.getRoomsList();
		if (!rooms.includes(value))
			throw new WsException("invalid room_id");
		return value;
	}
}