import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
import { IncomingMessage } from "http";
import { ChatService } from "src/chat/chat.service";
import { connected_users, playing, sockets } from "src/pong/pong.gateway";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { WebSocket } from "ws";
import { WsService } from "./ws.service";

@WebSocketGateway()
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private wsService: WsService,
    private chatService: ChatService,
    private usersService: UsersService,
  ) {}

  async handleConnection(client: WebSocket, req: IncomingMessage) {
    // authenticate user
    let user: User;
    try {
      user = await this.wsService.authenticateUser(req);
    } catch (error) {
      client.send(
        JSON.stringify({
          event: "ws_auth_fail",
          error: error,
        }),
      );
      client.close(1008, "Bad credentials");
      return;
    }
    // avoid duplicate connection for same user
    if (this.wsService.isUserOnline(user.id)) {
      client.send(
        JSON.stringify({
          event: "ws_auth_fail",
          reason: "already connected",
        }),
      );
      client.close(1008, "user already connected via another socket");
      return;
    }

    // add to map of connected users
    this.wsService.setUserOnline(user.id, client);
    // log client and server side
    client.send(
      JSON.stringify({
        event: "ws_auth_success",
      }),
    );
    // notify state change to friends
    this.wsService.notifyStatusChangeToFriends(user.id, "online");
    const rooms = await (
      await this.chatService.get_convs(user)
    ).filter((room) => room.type !== "DM");
    const users = rooms.map((room) => room.users.map((user) => user.id));
    const user_ids = users.reduce((prev, next) => {
      return prev.concat(next);
    }, []);
    this.wsService.sendMsgToUsersList(user_ids, {
      event: "group: online",
      data: { user_id: user.id },
    });
  }

  async handleDisconnect(client: WebSocket) {
    const user_id = this.wsService.getUserFromSocket(client);
    // remove entry from map
    if (this.wsService.setUserOffline(user_id)) {
      this.wsService.notifyStatusChangeToFriends(user_id, "offline");
    }
    const user = await this.usersService.findById(user_id);
    const rooms = await (
      await this.chatService.get_convs(user)
    ).filter((room) => room.type !== "DM");
    const users_ids = rooms
      .map((room) => room.users.map((user) => user.id))
      .reduce((prev, next) => prev.concat(next), []);
    this.wsService.sendMsgToUsersList(users_ids, {
      event: "group: offline",
      data: { user_id: user.id },
    });
  }

  @SubscribeMessage("isOnline")
  isOnline(client: WebSocket, data: { user_id: number; sender: number }) {
    const connectedUsers = this.wsService.getConnectedUsersIDs();
    this.wsService.sendMsgToUser(data.sender, {
      event: "isOnline",
      data: connectedUsers,
    });
  }

  @SubscribeMessage("isInGame")
  async isInGame(client: WebSocket, data: { sender: number }) {
    const inGame = Array.from(playing);
    const ids = sockets
      .map((s) => {
        const p1_id = connected_users.get(s.p1Socket);
        const p2_id = connected_users.get(s.p2Socket);
        return [
          { id: p1_id, sessionId: s.id },
          { id: p2_id, sessionId: s.id },
        ];
      })
      .reduce((prev, next) => prev.concat(next), []);
    this.wsService.sendMsgToUser(data.sender, {
      event: "isInGame",
      data: { inGame: inGame, usersSessionIds: ids },
    });
  }
}
