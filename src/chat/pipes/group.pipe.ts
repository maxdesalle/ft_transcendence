import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ChatService } from "../chat.service";

@Injectable()
export class GroupValidationPipe implements PipeTransform {
	constructor(private chatService: ChatService) {}

	async transform(value: any, metadata: ArgumentMetadata) {

		const rooms = await this.chatService.getRoomsList();
		if (!rooms.includes(value))
			throw new BadRequestException("invalid room_id")
		return value;
	}
}