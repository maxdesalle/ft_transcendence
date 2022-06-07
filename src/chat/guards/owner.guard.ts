import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { ChatService } from "../chat.service";

// checks if user is a participant in request's parameter room_id
export class GroupOwnerGuard implements CanActivate {
	constructor (
		@Inject(ChatService)
		private chatService: ChatService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean>{
		const request = context.switchToHttp().getRequest();
		const user_id = request.user.id;
		const room_id = request.body.room_id;
		const role = await this.chatService.get_role(user_id, room_id);
		return role === 2;	// OWNER
	}
}