import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { ChatService } from "../chat.service";

// checks if user is a participant in request's parameter room_id
export class IsParticipant implements CanActivate {
	constructor (
		@Inject(ChatService)
		private chatService: ChatService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean>{
		const request = context.switchToHttp().getRequest();
		const user = request.user;
		const room_id = request.params.room_id;
		const participants = await this.chatService.getRoomParcipants(room_id);
		return participants.includes(user.id);	
	}
}