import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Usr } from 'src/users/decorators/user.decorator';
import { WsService } from 'src/ws/ws.service';
import { friendReqEventDto, friendRequestDto } from './dto/friendReq.dto';
import { FrienshipStatus } from './entities/friendship.entity';
import { FriendsService } from './friends.service';

@Controller('friends')
@ApiTags('friends')
@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class FriendsController {
  constructor(
    private friendsService: FriendsService,
    private wsService: WsService,
  ) {}

  @Post('send_friend_request')
  async addFriend(
    @Usr() me,
    @Body('user_id', ParseIntPipe) user_id: number,
    @Body() _body: friendRequestDto,
  ) {
    const friend_request = await this.friendsService.requestFriendship(
      me.id,
      user_id,
    );
    const response: friendReqEventDto = {
      event: 'friends: new_request',
      friend_request,
    };
    this.wsService.sendMsgToUser(user_id, response);
    return response;
  }

  @Post('accept_friend_request')
  async acceptFriend(
    @Usr() me,
    @Body('user_id', ParseIntPipe) user_id: number,
    @Body() _body: friendRequestDto,
  ) {
    const friend_request = await this.friendsService.setFriendshipStatus(
      me.id,
      user_id,
      FrienshipStatus.accepted,
    );
    const response: friendReqEventDto = {
      event: 'friends: request_accepted',
      friend_request,
    };
    this.wsService.sendMsgToUser(user_id, response);
    return response;
  }

  @Post('reject_friend_request')
  @ApiResponse({ description: 'list of friends user_ids' })
  async rejectFriend(
    @Usr() me,
    @Body('user_id', ParseIntPipe) user_id: number,
    @Body() _body: friendRequestDto,
  ) {
    const friend_request = await this.friendsService.setFriendshipStatus(
      me.id,
      user_id,
      FrienshipStatus.rejected,
    );
    const response: friendReqEventDto = {
      event: 'friends: request_rejected',
      friend_request,
    };
    this.wsService.sendMsgToUser(user_id, response);
    return response;
  }

  @Get('pending_sent')
  @ApiOperation({
    summary:
      "friendship requests SENT by you that are pending of the other user's approval",
  })
  getPendingSent(@Usr() me) {
    return this.friendsService.pendingSentRequests(me.id);
  }

  @Get('pending_received')
  @ApiOperation({
    summary:
      'friendship requests RECEIVED by you that are pending of your approval',
  })
  getPendingReceived(@Usr() me) {
    return this.friendsService.pendingReceivedRequests(me.id);
  }

  @Get('rejected_received')
  @ApiOperation({ summary: 'friendship requests RECEIVED and rejected BY YOU' })
  listRejectedFriends(@Usr() me) {
    return this.friendsService.rejectedReceivedRequests(me.id);
  }

  @Get('id')
  @ApiOperation({ summary: "your friends' user_id" })
  @ApiResponse({ description: 'list of user_ids' })
  listFriendsIds(@Usr() me) {
    return this.friendsService.listFriendsIDs(me.id);
  }

  @Get()
  @ApiOperation({
    summary: "your friends' User object (more info than just ID)",
  })
  @ApiResponse({ description: 'list of Users' })
  listFriendsUsers(@Usr() me) {
    console.log(this.friendsService.listFriendsIDs(me.id));
    return this.friendsService.listFriendsUsers(me.id);
  }
}
