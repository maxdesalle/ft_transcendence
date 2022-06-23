import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { ChatService } from "../chat.service";

@Injectable()
export class ValidateRoomPipe implements PipeTransform {
	constructor(private chatService: ChatService) {}

	async transform(value: any, metadata: ArgumentMetadata) {

		const rooms = await this.chatService.listRooms();
		if (!rooms.includes(value))
			throw new BadRequestException("invalid room_id!")
		return value;
	}
}

@Injectable()
export class ValidGroupRoomPipe implements PipeTransform {
	constructor(private chatService: ChatService) {}

	async transform(value: any, metadata: ArgumentMetadata) {

		const rooms = await this.chatService.listRooms();
		if (!rooms.includes(value))
			throw new BadRequestException("invalid room_id");
		if (!await this.chatService.isGroupRoom(value))
			throw new BadRequestException("room is not a group");
		return value;
	}
}