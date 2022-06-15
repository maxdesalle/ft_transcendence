import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { WsGateway } from "../../websockets/ws.gateway";
import { ChatService } from "../chat.service";
import { WsService } from "../../websockets/ws.service";

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

@Injectable()
export class RoomGuard implements CanActivate {
	constructor (
		private chatService: ChatService,
		private wsAuthService: WsService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean>{
		const ctx = context.switchToWs();
		const socket = ctx.getClient();
		const user = this.wsAuthService.getUserFromSocket(socket);
		const room_id = +ctx.getData()?.room_id;
		// is room_id parameter present ?
		if (!room_id)
			throw new WsException('missing room_id');
		const participants = await this.chatService.getRoomParcipants(room_id);
		// is user a participant in room_id ?
		if (!participants.includes(user))
			throw new WsException('user is not a member of this room');

		// TODO
		// is user muted?
		// banned?
		// blocked?
		return true;	
	}
}