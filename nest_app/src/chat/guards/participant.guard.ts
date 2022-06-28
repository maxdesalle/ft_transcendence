import { BadRequestException, CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { ChatService } from "../chat.service";

/**  - checks if room_id is valid (param or request body)
- checks if user is a participant in request's parameter room_id */
export class RoomGuard implements CanActivate {
	constructor (
		@Inject(ChatService)
		private chatService: ChatService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean>{
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		let room_id = +request.params.room_id; // if GET request param
		if (!room_id)
			room_id = request.body.room_id; // if POST request body
		const rooms = await this.chatService.listRooms();
		if (!rooms.includes(room_id))
			throw new BadRequestException("invalid room_id...")
		const participants = await this.chatService.listRoomParticipants(room_id);
		return participants.includes(user.id);	
	}
}
