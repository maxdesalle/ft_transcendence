import { Body, ClassSerializerInterceptor, Controller, Get, ParseIntPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from 'src/users/decorators/user.decorator';
import { friendRequestDto } from './dto/friendReq.dto';
import { FrienshipStatus } from './entities/friendship.entity';
import { FriendsService } from './friends.service';

@Controller('friends')
@ApiTags('friends')
@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class FriendsController {
	constructor(
		private friendsService: FriendsService
	) {}

	@Post('send_friend_request')
	addFriend(
		@Usr() me,
		@Body('user_id', ParseIntPipe) user_id: number,
		@Body() _body: friendRequestDto
	) {
		return this.friendsService.requestFriendship(me.id, user_id);
	}

	@Post('accept_friend_request')
	acceptFriend(
		@Usr() me,
		@Body('user_id', ParseIntPipe) user_id: number,
		@Body() _body: friendRequestDto
	) {
		return this.friendsService
			.setFriendshipStatus(me.id, user_id, FrienshipStatus.accepted);
	}

	@Post('reject_friend_request')
	rejectFriend(
		@Usr() me,
		@Body('user_id', ParseIntPipe) user_id: number,
		@Body() _body: friendRequestDto
	) {
		return this.friendsService
			.setFriendshipStatus(me.id, user_id, FrienshipStatus.rejected);
	}

	@Get('pending_sent')
	@ApiOperation({ summary: "friendship requests SENT by you that are pending of the other user's approval"})
	@ApiResponse({ description: 'list of user_ids'})
	getPendingSent(
		@Usr() me
	) {
		return this.friendsService.pendingSentRequests(me.id);
	}	

	@Get('pending_received')
	@ApiOperation({ summary: 'friendship requests RECEIVED by you that are pending of your approval'})
	@ApiResponse({ description: 'list of user_ids'})
	getPendingReceived(
		@Usr() me
	) {
		return this.friendsService.pendingReceivedRequests(me.id);
	}	

	@Get('rejected_received')
	@ApiOperation({ summary: 'friendship requests RECEIVED and rejected BY YOU'})
	@ApiResponse({ description: 'list of user_ids'})
	listRejectedFriends(
		@Usr() me
	) {
		return this.friendsService.rejectedReceivedRequests(me.id);
	}

	@Get()
	@ApiResponse({ description: 'list of user_ids'})
	listFriendsIds(
		@Usr() me
	) {
		return this.friendsService.listFriendsIDs(me.id);
	}

	@Get('users')
	@ApiResponse({ description: 'list of Users (more info than just ID)'})
	listFriendsUsers(
		@Usr() me
	) {
		return this.friendsService.listFriendsUsers(me.id);
	}
	

}
