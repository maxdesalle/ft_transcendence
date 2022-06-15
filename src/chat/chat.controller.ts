import { Body, Controller, Get, Param, ParseIntPipe, Post, Res, UseGuards} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from 'src/users/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { WsService } from 'src/websockets/ws.service';
import { ChatService } from './chat.service';
import { Session } from './DTO/chat-user.dto';
import { PostDM, Message, RoomInfo, RoomInfoShort, GroupConfig, addGroupUserDTO, Message2Room } from './DTO/chat.dto';
import { GroupOwnerGuard } from './guards/owner.guard';
import { IsParticipant } from './guards/participant.guard';
import { ValidateRoomPipe } from './pipes/validate_room.pipe';
import { ValidateUserPipe } from './pipes/validate_user.pipe';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
	constructor(
		private chatService: ChatService,
		private wsService: WsService
	) {}

	// ============ DM ===========

	@Post('dm')
	@ApiTags('chat')
	async postDM(
		@Usr() me: User,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) destUserId: number,
		// @Body('message') message: string,
		@Body() body: PostDM
	) {
		const room_id = await this.chatService.sendDMtoUser(me, destUserId, body.message);
		this.wsService.sendMsgToUsersList([me.id, destUserId], {
			event: 'chat_dm',
			room_id,
			message: body.message
		})
	}

	@Get('dm/:user_id')
	@ApiTags('chat')
	getDMs(
		@Usr() me: User,
		@Param('user_id', ParseIntPipe, ValidateUserPipe) user_id: number
	): Promise<Message[]> {
		return this.chatService.getDMbyUser(me, user_id);
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
	@ApiTags('chat')
	@UseGuards(IsParticipant)
	getMessagesByRoomId(
		@Usr() user: User,
		@Param('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number
	): Promise<Message[]> {
		return this.chatService.getMessagesByRoomId(user, room_id);
	}

	@Get('room_info/:room_id')
	@ApiTags('chat')
	async groupInfo(
		@Param('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
	): Promise<RoomInfo> {
		// return this.chatService.roomInfo(room_id);
		return await this.chatService.roomInfo(room_id);
	}

	@Get('rooms')
	@ApiTags('chat')
	async getConvs(
		@Usr() user: User,
	): Promise<RoomInfoShort[]> {
		return await this.chatService.get_convs(user);
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
	@ApiTags('chat')
	async createGroup(
		@Usr() me: User,
		@Body() group_config: GroupConfig 
	): Promise<RoomInfoShort[]> {
		const room_id = await this.chatService.create_group(me, group_config);
		this.wsService.sendMsgToUser(me.id, {
			event: 'chat_new_group',
			room_id
		});

		return this.chatService.get_convs(me);
	}

	@Post('add_group_user')
	@ApiTags('chat')
	async addGroupUser(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) user_id: number,
		@Body() _body: addGroupUserDTO
	): Promise<RoomInfo> {
		await this.chatService.addGroupUser(me, room_id, user_id);
		// notify added user
		this.wsService.sendMsgToUser(user_id, {
			event: 'chat_new_group',
			room_id
		});
		// notify all users in group
		this.wsService.sendMsgToUsersList(
			await this.chatService.getRoomParcipants(room_id),
			{
				event: 'chat_new_user_in_group',
				room_id,
				user_id
			}
		)
		return this.chatService.roomInfo(room_id);
	}

	@Post('rm_group')
	@UseGuards(GroupOwnerGuard)
	async removeGroup(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number 
	) {
		await this.chatService.rm_group(me, room_id);
		return this.chatService.get_convs(me);
	}

	@Post('rm_group_user')
	async rmGroupUser(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
		@Body('unban_hours') unban_hours: number
	) {
		await this.chatService.rm_user_group(me, room_id, user_id, unban_hours);
		return this.chatService.roomInfo(room_id);
	}

	@Post('message_to_room')
	@ApiTags('chat')
	async postMsgToRoom(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('message') message: string,
		@Body() _body: Message2Room
	) {
		await this.chatService.send_msg_to_room(me, room_id, message);
		// return this.chatService.getMessagesByRoomId(me, room_id);
		this.wsService.sendMsgToUsersList(
			await this.chatService.getRoomParcipants(room_id),
			{
				event: 'chat_room_msg',
				room_id,
				message
			}
		)
	}

	@Post('mute_group_user')
	async mute(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
		@Body('unban_hours') unban_hours: number
	) {
		this.chatService.mute_user(me, room_id, user_id, unban_hours);
		return this.chatService.roomInfo(room_id);
	}

	@Post('unmute_group_user')
	async unmute(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		this.chatService.unmute_user(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}



	@Post('promote_group_user')
	async promote(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.add_admin_group(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('demote_group_user')
	async demote(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.rm_admin_group(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('leave_group')
	async leave(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
	) {
		await this.chatService.leave_group(me, room_id);
		return this.getConvs(me); 
	}

	@Post('set_password')
	@UseGuards(GroupOwnerGuard)
	async set_pswd(
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('password') password: string
	) {
		await this.chatService.set_password(room_id, password);
		return `new password set for room ${room_id}`
	}

	@Post('set_private')
	@UseGuards(GroupOwnerGuard)
	async set_private(
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('private') is_private: boolean
	) {
		await this.chatService.set_private(room_id, is_private);
		return this.chatService.roomInfo(room_id);
	}
	
	@Post('set_owner')
	@UseGuards(GroupOwnerGuard)
	async set_owner(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.set_owner(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('join_group')
	async join_group(
		@Usr() me: Session,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body('password') password: string,
	) {
		await this.chatService.join_public_group(me, room_id, password);
		return this.chatService.roomInfo(room_id);
	}
}
