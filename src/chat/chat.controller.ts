import { Body, Controller, Get, Param, ParseIntPipe, Post, Res, UseGuards} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Usr } from 'src/users/decorators/user.decorator';
import { ChatService } from './chat.service';
import { GroupConfig, Session, userJwtPayload } from './DTO/chat-user.dto';
import { JwtChatGuard } from './guards/jwt.guard';
import { IsParticipant } from './guards/participant.guard';
import { GroupValidationPipe } from './pipes/group.pipe';

@Controller('chat')
@UseGuards(JwtChatGuard)
export class ChatController {
	constructor(
		private chatService: ChatService,
		// private jwtService: JwtService,
	) {}

	// @Post('select')
	// async select_room(
	// 	@Usr() user: Session,
	// 	@Body('value') room_id: number,
	// 	@Res({ passthrough: true }) res: Response
	// ) {

	// 	await this.chatService.on_select(user, room_id, true);
	// 	// update JWT with select room
	// 	const payload: userJwtPayload = {
	// 		id: user.id,
	// 		username: user.username,
	// 		selected_room: user.selected_room
	// 	}
	// 	const jwtToken = this.jwtService.sign(payload);
	// 	res.cookie('jwt_token', jwtToken);
	// 	return user; // instead of loggin to the terminal, I'm returning it for debugging purposes
	// }

	// @Post('message')
	// async sendDirectMsg(
	// 	@Usr() user: Session,
	// 	@Body('value') msg: string,
	// ) {
	// 	await this.chatService.send_dm(user, msg);
	// 	return `new message= ${msg}`;
	// }

	// ============ DM ===========

	@Post('dm')
	postDM(
		@Usr() me: Session,
		@Body('to') destUserId,
		@Body('message') message
	) {
		return this.chatService.sendDMtoUser(me, destUserId, message);
	}

	@Get('dm/:friend_id')
	getDMs(
		@Usr() me: Session,
		@Param('friend_id', ParseIntPipe) friend_id: number
	) {
		return this.chatService.getDMbyUser(me, friend_id);
	}

	@Post('block')
	async blockUser(
		@Usr() user: Session,
		@Body('user_id') blocked_id: number,
	) {
		await this.chatService.block(user, blocked_id);
		return this.chatService.get_blocked(user);
	}

	@Post('unblock')
	async unblockUser(
		@Usr() user: Session,
		@Body('user_id') blocked_id: number,
	) {
		await this.chatService.unblock(user, blocked_id);
		return this.chatService.get_blocked(user);
	}

	@Get('blocked')
	checkBlocked(
		@Usr() user: Session,
	) {
		return this.chatService.get_blocked(user);
	}


	// @Get('message')
	// async getMessages(
	// 	@Usr() user: Session,
	// ) {
	// 	await this.chatService.get_message(user);
	// 	return user;
	// }

	// ============ Channels ===========

	@Get('room_messages/:room_id')
	@UseGuards(IsParticipant)
	getMessagesByRoomId(
		@Usr() user: Session,
		@Param('room_id', ParseIntPipe) room_id: number
	) {
		return this.chatService.getMessagesByRoomId(user, room_id);
	}

	@Get('conversations')
	getConvs(
		@Usr() user: Session,
	) {
		return this.chatService.get_convs(user);
	}

	// @Post('add_friend')
	// async addFriend(
	// 	@Usr() user: Session,
	// 	@Body('value') friend_id: number,
	// ) {
	// 	await this.chatService.create_dm_room(user, friend_id);

	// 	// possibly move this call to inside addFriend()
	// 	await this.chatService.get_convs(user);
	// 	return user;
	// }

	// // route for debug only, no point in removing a dm_room
	// @Post('rm_friend')
	// async removeFriend(
	// 	@Usr() user: Session,
	// 	@Body('value') friend_id: number,
	// ) {
	// 	await this.chatService.rm_dm_room(user, friend_id);

	// 	// possibly move this call to inside addFriend()
	// 	await this.chatService.get_convs(user);
	// 	return user;
	// }

	// @Get('friends')
	// getFriends(
	// 	@Usr() user: Session
	// ) {
	// 	return this.chatService.getDMusersID(user);
	// }

	// @Get('dm_room/:friend_id')
	// getDmRoom(
	// 	@Usr() user: Session,
	// 	@Param('friend_id') friend_id: number,
	// ) {
	// 	return this.chatService.get_dm_room(user, friend_id);
	// }

	@Post('create_group')
	async createGroup(
		@Usr() me: Session,
		@Body() group_config: GroupConfig 
	) {
		await this.chatService.create_group(me, group_config);
		return this.chatService.get_convs(me);
	}

	@Post('rm_group')
	async removeGroup(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, GroupValidationPipe) room_id: number 
	) {
		await this.chatService.rm_group(me, room_id);
		return this.chatService.get_convs(me);
	}

	@Post('add_group_user')
	async addGroupUser(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, GroupValidationPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.addGroupUser(me, room_id, user_id);
		return this.chatService.roomUsersStatus(room_id);
	}

	@Post('rm_group_user')
	async rmGroupUser(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, GroupValidationPipe) room_id: number,
		@Body('user_id') user_id: number,
		@Body('unban_hours') unban_hours: number
	) {
		await this.chatService.rm_user_group(me, room_id, user_id, unban_hours);
		return this.chatService.roomUsersStatus(room_id);
	}

	@Post('group_message')
	async sendGroupMessage(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, GroupValidationPipe) room_id: number,
		@Body('message') message: string,
	) {
		await this.chatService.send_group_msg(me, room_id, message);
		return this.chatService.getMessagesByRoomId(me, room_id);
	}

	@Post('mute_group_user')
	async mute(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, GroupValidationPipe) room_id: number,
		@Body('user_id') user_id: number,
		@Body('unban_hours') unban_hours: number
	) {
		this.chatService.mute_user(me, room_id, user_id, unban_hours);
		return this.chatService.roomUsersStatus(room_id);
	}

	@Post('unmute_group_user')
	async unmute(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, GroupValidationPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		this.chatService.unmute_user(me, room_id, user_id);
		return this.chatService.roomUsersStatus(room_id);
	}

	@Get('group_users/:room_id')
	checkGroupUser(
		@Param('room_id', ParseIntPipe, GroupValidationPipe) room_id: number,
	) {
		return this.chatService.roomUsersStatus(room_id);
	}

	@Post('promote_group_user')
	async promote(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, GroupValidationPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.add_admin_group(me, room_id, user_id);
		return this.chatService.roomUsersStatus(room_id);
	}

	@Post('demote_group_user')
	async demote(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, GroupValidationPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.rm_admin_group(me, room_id, user_id);
		return this.chatService.roomUsersStatus(room_id);
	}
}
