import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Res, UseGuards} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from 'src/users/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { WsService } from 'src/ws/ws.service';
import { ChatService } from './chat.service';
import { PostDmDto, MessageDTO, RoomInfo, RoomInfoShort, GroupConfig, addGroupUserDTO, Message2RoomDTO, addGroupUserByNameDTO, UserIdDto, banDTO, muteDTO, RoomIdDto } from './DTO/chat.dto';
import { RoomGuard } from './guards/participant.guard';
import { ValidateRoomPipe, ValidGroupRoomPipe } from './pipes/validate_room.pipe';
import { UserDisplayNameToIdPipe, ValidateUserPipe } from './pipes/validate_user.pipe';

@Controller('chat')
@UseGuards(JwtGuard)
@ApiTags('chat')
export class ChatController {
	constructor(
		private chatService: ChatService,
		private wsService: WsService
	) {}

	// ============ DM ===========

	@Post('dm')
	async postDM(
		@Usr() me: User,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) destUserId: number,
		// @Body('message') message: string,
		@Body() body: PostDmDto
	) {
		const message: MessageDTO = 
			await this.chatService.sendDMtoUser(me, destUserId, body.message);

		// notify both users, if not blocked
		if (! await this.chatService.is_blocked(me.id, destUserId)) {
			this.wsService.sendMsgToUsersList([me.id, destUserId], {
				event: 'chat_dm',
				message
			});
		}
		return message;
	}

	@Get('dm/:user_id')
	async getDMs(
		@Usr() me: User,
		@Param('user_id', ParseIntPipe, ValidateUserPipe) user_id: number
	): Promise<MessageDTO[]> {
		return this.chatService.getDMbyUser(me, user_id);
	}

	@Post('block')
	async blockUser(
		@Usr() me: User,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) blocked_id: number,
		@Body() _body: UserIdDto,
	) {
		await this.chatService.block_user(me, blocked_id);
		return this.chatService.listBlockedUsers(me.id);
	}

	@Post('unblock')
	async unblockUser(
		@Usr() me: User,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) blocked_id: number,
		@Body() _body: UserIdDto,
	) {
		await this.chatService.unblock_user(me, blocked_id);
		return this.chatService.listBlockedUsers(me.id);
	}

	@Get('blocked')
	checkBlocked(
		@Usr() user: User,
	) {
		return this.chatService.listBlockedUsers(user.id);
	}

	// ============ Groups ===========

	@Post('group_message') // OK
	async postGroupMsg(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body() body: Message2RoomDTO
	) {
		const message = await this.chatService.postGroupMsg(me, room_id, body.message);
		// notify group members
		this.wsService.sendMsgToUsersList(
			await this.chatService.listRoomParticipants(room_id),
			{ event: 'chat_room_msg', message }
		)
		return message;

	}
	
	// for compability. prefer post /group_message
	@Post('message_to_room')
	async postMsgToRoom(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body() body: Message2RoomDTO
	) {
		if (await this.chatService.isGroupRoom(room_id))
			return this.postGroupMsg(me, room_id, body);
		// TODO: else call postDM
		return 'hello'
	}

	@Get('room_messages/:room_id')
	@UseGuards(RoomGuard)
	async getMessagesByRoomId(
		@Usr() user: User,
		@Param('room_id', ParseIntPipe) room_id: number
	) {
		if (await this.chatService.isBlockedDMroom(room_id))
			throw new ForbiddenException("you are blocked OR the user is blocked by you")
		return this.chatService.getMessagesByRoomId(user, room_id);
	}

	@Get('room_info/:room_id')
	async groupInfo(
		@Param('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
	): Promise<RoomInfo> {
		// return this.chatService.roomInfo(room_id);
		return await this.chatService.roomInfo(room_id);
	}

	@Get('conversations')
	async getConvs(
		@Usr() user: User,
	): Promise<RoomInfoShort[]> {
		return await this.chatService.get_convs(user);
	}


	@Post('create_group')
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
	async addGroupUser(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) user_id: number,
		@Body() _body?: addGroupUserDTO
	): Promise<RoomInfo> {
		await this.chatService.addGroupUser(me, room_id, user_id);
		// notify added user
		this.wsService.sendMsgToUser(user_id, {
			event: 'chat_new_group',
			room_id
		});
		// notify all users in group
		this.wsService.sendMsgToUsersList(
			await this.chatService.listRoomParticipants(room_id),
			{
				event: 'chat_new_user_in_group',
				room_id,
				user_id
			}
		)
		return this.chatService.roomInfo(room_id);
	}
	
	@Post('add_group_user_by_name')
	async addGroupUserbyName(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_display_name', UserDisplayNameToIdPipe) user_id: number,
		@Body() _body: addGroupUserByNameDTO
	): Promise<RoomInfo> {
		return this.addGroupUser(me, room_id, user_id);
	}

	@Post('rm_group')
	async removeGroup(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body() _body: RoomIdDto
	) {
		await this.chatService.rm_group(me, room_id);
		return this.chatService.get_convs(me);
	}

	@Post('ban_group_user')
	async rmGroupUser(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) user_id: number,
		@Body('ban_minutes') ban_minutes: number,
		@Body() _body: banDTO
	) {
		await this.chatService.ban_group_user(me, room_id, user_id, ban_minutes);
		return this.chatService.roomInfo(room_id);
	}

	@Post('mute_group_user')
	async mute(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) user_id: number,
		@Body('mute_minutes') mute_minutes: number,
		@Body() _body: muteDTO
	) {
		this.chatService.mute_user(me, room_id, user_id, mute_minutes);
		return this.chatService.roomInfo(room_id);
	}

	@Post('unmute_group_user')
	async unmute(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		this.chatService.unmute_user(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('promote_group_user')
	async promote(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.add_admin_group(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('demote_group_user')
	async demote(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.rm_admin_group(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('leave_group')
	async leave(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
	) {
		await this.chatService.leave_group(me, room_id);
		return this.getConvs(me); 
	}

	// TODO: DTO for password, validate it / pswd policy
	@Post('set_password')
	async set_pswd(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('password') password: string
	) {
		await this.chatService.set_password(me, room_id, password);
		return `new password set for room ${room_id}`
	}

	@Post('set_private')
	async set_private(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('private') is_private: boolean
	) {
		await this.chatService.set_private(me, room_id, is_private);
		return this.chatService.roomInfo(room_id);
	}
	
	@Post('set_owner')
	async set_owner(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
	) {
		await this.chatService.set_owner(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('join_group')
	async join_group(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('password') password: string,
	) {
		await this.chatService.join_public_group(me, room_id, password);
		return this.chatService.roomInfo(room_id);
	}

	// @Get('test')
	// test() {
	// 	return this.chatService.isDmRoom(1);
	// }
}
