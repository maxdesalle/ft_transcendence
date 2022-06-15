import { Body, ClassSerializerInterceptor, Controller, Get, ParseIntPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from 'src/users/decorators/user.decorator';
import { FrienshipStatus } from './entities/friendship.entity';
import { FriendsService } from './friends.service';

@Controller('friends')
@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class FriendsController {
	constructor(
		private friendsService: FriendsService
	) {}

	@Post('add')
	addFriend(
		@Usr() me,
		@Body('user_id', ParseIntPipe) user_id: number
	) {
		return this.friendsService.requestFriendship(me.id, user_id);
	}

	@Get('pending_sent')
	getPendingSent(
		@Usr() me
	) {
		return this.friendsService.pendingSentRequests(me.id);
	}	

	@Get('pending_received')
	getPendingReceived(
		@Usr() me
	) {
		return this.friendsService.pendingReceivedRequests(me.id);
	}	

	@Post('accept')
	acceptFriend(
		@Usr() me,
		@Body('user_id', ParseIntPipe) user_id: number
	) {
		return this.friendsService
			.setFriendshipStatus(me.id, user_id, FrienshipStatus.accepted);
	}

	@Post('reject')
	rejectFriend(
		@Usr() me,
		@Body('user_id', ParseIntPipe) user_id: number
	) {
		return this.friendsService
			.setFriendshipStatus(me.id, user_id, FrienshipStatus.rejected);
	}

	@Get()
	listFriends(
		@Usr() me
	) {
		return this.friendsService.listFriends(me.id);
	}

	@Get('rejected')
	listRejectedFriends(
		@Usr() me
	) {
		return this.friendsService.rejectedReceivedRequests(me.id);
	}



}
