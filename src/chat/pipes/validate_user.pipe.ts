import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { ChatService } from "../chat.service";

@Injectable()
export class ValidateUserPipe implements PipeTransform {
	constructor(private usersService: UsersService) {}

	async transform(value: any, metadata: ArgumentMetadata) {

		// const rooms = await this.chatService.getRoomsList();
		// if (!rooms.includes(value))
		// 	throw new BadRequestException("invalid room_id")
		const user = await this.usersService.findById(value);
		if (!user)
			throw new BadRequestException("invalid user_id")
		return value;
	}
}