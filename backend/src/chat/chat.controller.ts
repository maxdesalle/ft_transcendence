import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from 'src/users/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { WsService } from 'src/ws/ws.service';
import { ChatService } from './chat.service';
import { PostDmDto, MessageDTO, RoomInfo, RoomInfoShort, GroupConfigDto, Message2RoomDTO, AddGroupUserByNameDTO, UserIdDto, BanMuteDTO, RoomIdDto, RoomAndUserDto, RoomAndPasswordDto, SetPrivateDto } from './DTO/chat.dto';
import { ValidateRoomPipe, ValidGroupRoomPipe } from './pipes/validate_room.pipe';
import { UserDisplayNameToIdPipe, ValidateUserPipe } from './pipes/validate_user.pipe';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
	constructor(
		private chatService: ChatService,
		private wsService: WsService
	) {}
	
	// ============ DM ===========

	@Post('dm') // OK
	@ApiTags('chat - DM')
	async postDM(
		@Usr() me: User,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) destUserId: number,
		@Body() body: PostDmDto
	) {
		const message: MessageDTO = 
			await this.chatService.postDM(me, destUserId, body.message);
		// notify both users
		this.wsService.sendMsgToUsersList([me.id, destUserId], {
			event: 'chat_dm',
			message
		});
		return message;
	}

	@Get('dm/:user_id') // OK
	@ApiTags('chat - DM')
	async getDMs(
		@Usr() me: User,
		@Param('user_id', ParseIntPipe, ValidateUserPipe) user_id: number
	): Promise<MessageDTO[]> {
		return this.chatService.getDMbyUser(me, user_id);
	}

	@Post('block')
	@ApiTags('chat - DM')
	@ApiResponse({description: 'list of users that you blocked + blocked you'})
	async blockUser(
		@Usr() me: User,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) blocked_id: number,
		@Body() _body: UserIdDto,
	) {
		await this.chatService.block_user(me, blocked_id);
		return this.chatService.listBlockedUsers(me.id);
	}

	@Post('unblock')
	@ApiTags('chat - DM')
	@ApiResponse({description: 'list of users that you blocked + blocked you'})
	async unblockUser(
		@Usr() me: User,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) blocked_id: number,
		@Body() _body: UserIdDto,
	) {
		await this.chatService.unblock_user(me, blocked_id);
		return this.chatService.listBlockedUsers(me.id);
	}

	@Get('blocked')
	@ApiTags('chat - DM')
	@ApiResponse({description: 'list of users that you blocked + blocked you'})
	checkBlocked(
		@Usr() user: User,
	) {
		return this.chatService.listBlockedUsers(user.id);
	}

	// ============ Groups ===========

	@Get('public_groups')
	@ApiTags('chat - groups')
	async getPublicRooms(): Promise<RoomInfo[]> {
		return await this.chatService.showPublicRooms();
	}

	@Post('join_group')
	@ApiTags('chat - groups')
	async join_group(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('password') password: string,
		@Body() _room: RoomAndPasswordDto
	) {
		await this.chatService.join_public_group(me, room_id, password);
		return this.chatService.roomInfo(room_id);
	}

	@Post('leave_group')
	@ApiTags('chat - groups')
	async leave(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body() _room: RoomIdDto
	) {
		await this.chatService.leave_group(me, room_id);
		return this.getConvs(me); 
	}

	@Post('group_message') // OK
	@ApiTags('chat - groups')
	async postGroupMsg(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body() body: Message2RoomDTO
	): Promise<MessageDTO> {
		const message = await this.chatService.postGroupMsg(me, room_id, body.message);
		// notify group members
		this.wsService.sendMsgToUsersList(
			await this.chatService.listRoomParticipants(room_id),
			{ event: 'chat_room_msg', message }
		)
		return message;
	}

	@Get('group_messages/:room_id') // OK
	@ApiTags('chat - groups')
	async getGroupMessages(
		@Usr() me: User,
		@Param('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number
	) {
		return this.chatService.getGroupMessages(me, room_id);
	}
	
	// ====== GROUP ADMIN ============

	@Post('create_group')
	@ApiTags('chat - group admin')
	async createGroup(
		@Usr() me: User,
		@Body() group_config: GroupConfigDto 
	): Promise<RoomInfoShort[]> {
		const room_id = await this.chatService.create_group(me, group_config);
		this.wsService.sendMsgToUser(me.id, {
			event: 'chat_new_group',
			room_id
		});

		return this.chatService.get_convs(me);
	}

	@Post('rm_group')
	@ApiTags('chat - group admin')
	async removeGroup(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body() _body: RoomIdDto
	) {
		await this.chatService.rm_group(me, room_id);
		return this.chatService.get_convs(me);
	}

	@Post('add_group_user')
	@ApiTags('chat - group admin')
	async addGroupUser(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) user_id: number,
		@Body() _body?: RoomAndUserDto
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
	@ApiTags('chat - group admin')
	async addGroupUserbyName(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_display_name', UserDisplayNameToIdPipe) user_id: number,
		@Body() _body: AddGroupUserByNameDTO
	): Promise<RoomInfo> {
		return this.addGroupUser(me, room_id, user_id);
	}

	@Post('ban_group_user')
	@ApiTags('chat - group admin')
	async banUser(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) user_id: number,
		@Body('time_minutes') ban_minutes: number,
		@Body() _body: BanMuteDTO
	) {
		await this.chatService.ban_group_user(me, room_id, user_id, ban_minutes);
		return this.chatService.roomInfo(room_id);
	}

	@Post('unban_group_user')
	@ApiTags('chat - group admin')
	async unbanUser(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) user_id: number,
		@Body() _body: RoomAndUserDto
	) {
		await this.chatService.unban_group_user(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('mute_group_user')
	@ApiTags('chat - group admin')
	async mute(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id', ParseIntPipe, ValidateUserPipe) user_id: number,
		@Body('time_minutes') mute_minutes: number,
		@Body() _body: BanMuteDTO
	) {
		await this.chatService.mute_user(me, room_id, user_id, mute_minutes);
		return this.chatService.roomInfo(room_id);
	}

	@Post('unmute_group_user')
	@ApiTags('chat - group admin')
	async unmute(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
		@Body() _body: RoomAndUserDto
	) {
		await this.chatService.unmute_user(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('promote_group_user')
	@ApiTags('chat - group admin')
	async promote(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
		@Body() _body: RoomAndUserDto
	) {
		await this.chatService.add_admin_group(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	@Post('demote_group_user')
	@ApiTags('chat - group admin')
	async demote(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
		@Body() _body: RoomAndUserDto
	) {
		await this.chatService.rm_admin_group(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}
	
	// password: NULL or undefined to remove password
	@Post('set_password')
	@ApiTags('chat - group admin')
	@ApiOperation({summary: 'set password to null or undefined to remove it'})
	async set_pswd(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body() body: RoomAndPasswordDto
	) {
		await this.chatService.set_password(me, room_id, body.password);
		return `new password set for room ${room_id}`
	}

	@Post('set_private')
	@ApiTags('chat - group admin')
	async set_private(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body() body: SetPrivateDto
	) {
		await this.chatService.set_private(me, room_id, body.private);
		return this.chatService.roomInfo(room_id);
	}
	
	@Post('set_owner')
	@ApiTags('chat - group admin')
	async set_owner(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidGroupRoomPipe) room_id: number,
		@Body('user_id') user_id: number,
		@Body() _body: RoomAndUserDto
	) {
		await this.chatService.set_owner(me, room_id, user_id);
		return this.chatService.roomInfo(room_id);
	}

	// ====== INFO (general) ========================

	@Get('room_info/:room_id') // OK
	@ApiTags('chat - general(DM + groups)')
	groupInfo(
		@Param('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
	): Promise<RoomInfo> {
		return this.chatService.roomInfo(room_id);
	}

	@Get('conversations') // OK
	@ApiTags('chat - general(DM + groups)')
	@ApiOperation({summary:' DMs + groups'})
	getConvs(
		@Usr() user: User,
	): Promise<RoomInfoShort[]> {
		return this.chatService.get_convs(user);
	}


	// ============ for compability ===========

	@Post('message_to_room') // OK
	@ApiTags('chat - compatibility')
	@ApiOperation({summary: `Route for compability with previous versions.
		Prefer POST /dm or /group message`})
	async postMsgToRoom(
		@Usr() me: User,
		@Body('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number,
		@Body() body: Message2RoomDTO
	): Promise<MessageDTO> {
		// case: group room
		if (await this.chatService.isGroupRoom(room_id))
			return this.postGroupMsg(me, room_id, body);

		// case DM room
		const message = 
			await this.chatService.postDMbyRoomId(me, room_id, body.message);
		// notify both users
		this.wsService.sendMsgToUsersList(
			await this.chatService.listRoomParticipants(room_id),
			{ event: 'chat_dm',	message }
		);
		return message;
	}

	@Get('room_messages/:room_id') // OK
	@ApiTags('chat - compatibility')
	@ApiOperation({summary: `Route for compability with previous versions.
		Prefer GET /dm or /group messages`})
	async getMessagesByRoomId(
		@Usr() me: User,
		@Param('room_id', ParseIntPipe, ValidateRoomPipe) room_id: number
	) {
		// case: group room
		if (await this.chatService.isGroupRoom(room_id))
			return this.getGroupMessages(me, room_id);
		
		// case: DM room
		return this.chatService.getDMsByRoomID(me, room_id);
	}

	// @Get('test')
	// test() {
	// 	return this.chatService.listGroups();
	// }

}
