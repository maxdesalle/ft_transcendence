import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IncomingMessage } from 'http';
import { parse } from 'cookie';
import { WebSocket } from 'ws';
import { FriendsService } from 'src/friends/friends.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WsService {
  static connected_users = new Map<number, WebSocket>();

  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => FriendsService))
    private friendsService: FriendsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  // throws exception if verify fails
  // returns user {id, login42} upon success
  async authenticateUser(req: IncomingMessage) {
    let token;
    try {
      token = parse(req.headers.cookie)['jwt_token'];
    } catch {
      throw 'jwt_token cookie is absent'; // more meaningful message
    }
    const user = this.jwtService.verify(token); // might thow
    const stored_user = await this.usersService.findById(user.id);
    if (!stored_user) throw 'User does not exist in database';
    if (stored_user.login42 !== user.login42)
      throw 'User.login42 does not match';
    return user;
  }

  getUserFromSocket(socket: WebSocket) {
    for (const [key, value] of WsService.connected_users.entries()) {
      if (value === socket) return key;
    }
  }

  getConnectedUsersIDs() {
    const list: number[] = [];
    for (const key of WsService.connected_users.keys()) list.push(key);
    return list;
  }

  isUserOnline(user_id: number): boolean {
    return WsService.connected_users.has(user_id);
  }

  setUserOnline(user_id: number, socket: WebSocket) {
    WsService.connected_users.set(user_id, socket);
  }

  setUserOffline(user_id: number) {
    return WsService.connected_users.delete(user_id);
  }

  sendMsgToUser(user_id: number, data: any) {
    if (WsService.connected_users.has(user_id))
      WsService.connected_users.get(user_id).send(JSON.stringify(data));
  }

  sendMsgToUsersList(users: number[], data: any) {
    for (const user_id of users) {
      this.sendMsgToUser(user_id, data);
    }
  }

  sendMsgToAll(data: any) {
    this.sendMsgToUsersList(this.getConnectedUsersIDs(), data);
  }

  async notifyStatusChangeToFriends(user_id: number, status: string) {
    const friends = await this.friendsService.listFriendsIDs(user_id);
    this.sendMsgToUsersList(friends, {
      event: `status: friend_${status}`,
      user_id,
    });
  }

  async notifyStatusChangeToFriendsWsessionId(
    user_id: number,
    data: { status: string; sessionId: number },
  ) {
    const friends = await this.friendsService.listFriendsIDs(user_id);
    this.sendMsgToUsersList(friends, {
      event: `status: friend_${data.status}`,
      data,
    });
  }

  async notifyStatusToFriendsAuto(user_id: number) {
    const status = this.friendsService.getUserStatus(user_id);
    const friends = await this.friendsService.listFriendsIDs(user_id);
    this.sendMsgToUsersList(friends, {
      event: `status: friend_${status}`,
      user_id,
    });
  }
}
