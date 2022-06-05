import { Body, Controller, Get, Param, Post, Res, UseGuards} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Usr } from 'src/users/decorators/user.decorator';
import { ChatService } from './chat.service';
import { GroupConfig, Session, userJwtPayload } from './DTO/chat-user.dto';
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

	@Post('dm')
	async dm(
		@Usr() me: Session,
		@Body('to') destUserId,
		@Body('message') message
	) {
		return this.chatService.dm_to_user(me, destUserId, message);
	}

	@Get('dm/:friend_id')
	getDMs(
		@Usr() me: Session,
		@Param('friend_id') friend_id: number
	) {
		return this.chatService.getDMbyUser(me, friend_id);
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

		// possibly move this call to inside block()
		await this.chatService.get_blocked(user);
		return user;
	}

	@Post('unblock')
	async unblockUser(
		@Usr() user: Session,
		@Body('value') blocked_id: number,
	) {
		await this.chatService.unblock(user, blocked_id);

		// possibly move this call to inside block()
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

	@Get('conversations')
	async getConvs(
		@Usr() user: Session,
	) {
		await this.chatService.get_convs(user);
		return user;
	}

	@Post('add_friend')
	async addFriend(
		@Usr() user: Session,
		@Body('value') friend_id: number,
	) {
		await this.chatService.create_dm_room(user, friend_id);

		// possibly move this call to inside addFriend()
		await this.chatService.get_convs(user);
		return user;
	}

	// route for debug only, no point in removing a dm_room
	@Post('rm_friend')
	async removeFriend(
		@Usr() user: Session,
		@Body('value') friend_id: number,
	) {
		await this.chatService.rm_dm_room(user, friend_id);

		// possibly move this call to inside addFriend()
		await this.chatService.get_convs(user);
		return user;
	}

	@Get('friends')
	getFriends(
		@Usr() user: Session
	) {
		return this.chatService.get_friends(user);
	}

	@Get('dm_room/:friend_id')
	getDmRoom(
		@Usr() user: Session,
		@Param('friend_id') friend_id: number,
	) {
		return this.chatService.get_dm_room(user, friend_id);
	}

	@Post('create_group')
	createGroup(
		@Usr() user: Session,
		@Body() group_config: GroupConfig 
	) {
		return this.chatService.create_group(user, group_config);
	}

	@Post('add_group_user')
	addGroupUser(
		@Usr() me: Session,
		@Body('room_id') room_id: number,
		@Body('user_id') user_id: number,
	) {
		return this.chatService.add_user_group(me, room_id, user_id);
	}

	@Post('group_message')
	sendGroupMessage(
		@Usr() me: Session,
		@Body('room_id') room_id: number,
		@Body('message') message: string,
	) {
		return this.chatService.send_group_msg(me, room_id, message);
	}
}
