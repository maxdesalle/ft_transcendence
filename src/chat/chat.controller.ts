import { Body, Controller, Get, Post, Res, UseGuards} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Usr } from 'src/users/decorators/user.decorator';
import { ChatService } from './chat.service';
import { Session, userJwtPayload } from './DTO/chat-user.dto';
import { JwtChatGuard } from './guards/jwt.guard';

@Controller('chat')
@UseGuards(JwtChatGuard)
export class ChatController {
	constructor(
		private chatService: ChatService,
		private jwtService: JwtService,
	) {}

	@Post('select')
	async select_room(
		@Usr() user: Session,
		@Body('value') room_id: number,
		@Res({ passthrough: true }) res: Response
	) {

		await this.chatService.on_select(user, room_id, true);
		// update JWT with select room
		const payload: userJwtPayload = {
			id: user.id,
			username: user.username,
			selected_room: user.selected_room
		}
		const jwtToken = this.jwtService.sign(payload);
		res.cookie('jwt_token', jwtToken);
		return user; // instead of loggin to the terminal, I'm returning it for debugging purposes
	}

	@Post('message')
	async sendDirectMsg(
		@Usr() user: Session,
		@Body('value') msg: string,
	) {
		await this.chatService.send_dm(user, msg);
		return `new message= ${msg}`;
	}

	@Get('message')
	async getMessages(
		@Usr() user: Session,
	) {
		await this.chatService.get_message(user);
		return user;
	}

	@Post('block')
	async blockUser(
		@Usr() user: Session,
		@Body('value') blocked_id: number,
	) {
		await this.chatService.block(user, blocked_id);

		await this.chatService.get_blocked(user);
		return user;
	}

	@Post('unblock')
	async unblockUser(
		@Usr() user: Session,
		@Body('value') blocked_id: number,
	) {
		await this.chatService.unblock(user, blocked_id);

		await this.chatService.get_blocked(user);
		return user;
	}

	@Get('blocked')
	async checkBlocked(
		@Usr() user: Session,
	) {
		await this.chatService.get_blocked(user);
		return user;
	}

}
