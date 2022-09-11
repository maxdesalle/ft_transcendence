import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import { WebSocket, WebSocketServer as WSS } from 'ws';
import { computeValues, deleteGameSession } from './computeValues';
import { default_values } from './defaultVals';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { WsService } from 'src/ws/ws.service';
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { StatsService } from 'src/stats/stats.service';
import { PongGuard } from './guards/pong.guard';
import { FriendsService } from 'src/friends/friends.service';

const defaultVals = default_values.df;

// type of object that represents a game session
interface gameSocketsInterface {
  id: number; // game session id
  p1Socket: WebSocket;
  p2Socket: WebSocket;
  p1Ob: object; // will contain info that p1 sent
  p2Ob: object; // will contain info that p2 sent
}
// array that contains all viewers sockets (id is game session id that the viewer is watching)
const viewerSockets: { id: number; ws: WebSocket }[] = [];
// object that will be returned by linkPlayers (contains final score)
interface playerScoresInterface {
  p1Score: number;
  p2Score: number;
}
export const sockets: gameSocketsInterface[] = []; // array that will contain session objects

// keeps track of who is connected to /pong/ gateway (socket - user_id pairs)
export const connected_users = new Map<WebSocket, number>();
// pending invitations to play (inviting user_id - invited user_id pairs )
const invitations = new Map<number, number>();
// player waiting to be matched with the first to join
let waiting_player: { user_id: number; socket: WebSocket } = null;
// set of user_ids that are currently playing a match
export const playing = new Set<number>();

@WebSocketGateway({ path: '/pong' })
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => WsService))
    private wsService: WsService,
    private statsService: StatsService,
    @Inject(forwardRef(() => FriendsService))
    private friendService: FriendsService,
  ) {}

  // authenticates user
  async handleConnection(ws: WebSocket, req: IncomingMessage) {
    let user: { id: number; login42: string };
    try {
      user = await this.wsService.authenticateUser(req);
    } catch (error) {
      ws.close(1008, 'Bad credentials');
      console.log('Authentication to Pong wss failed');
      return;
    }
    // add to connected_users map
    connected_users.set(ws, user.id);
    console.log(`User ${user.login42} (id: ${user.id}) connected to pong WSS`);

    ws.on('error', (e) => console.error(`socket error: ${e.message}`));
  }

  handleDisconnect(client: WebSocket) {
    const user_id = connected_users.get(client);
    connected_users.delete(client);
    playing.delete(user_id);
    clearInviteWait(user_id);
    removeGameSession(client);
    this.wsService.sendMsgToAll({
      event: `pong: session_over`,
    });
    if (user_id) console.log(`User ${user_id} disconnected from pong wss`);
  }

  @SubscribeMessage('play')
  @UseGuards(PongGuard)
  playAgainstAnyone(client: WebSocket) {
    const user_id = connected_users.get(client);

    if (waiting_player?.user_id == user_id) {
      console.log('You shall not play against yourself');
      return;
    }

    // check if there's a waiting player
    if (waiting_player) {
      // notify boths users
      this.wsService.sendMsgToUsersList([waiting_player.user_id, user_id], {
        event: 'pong: player_joined',
        waiting_player: waiting_player.user_id,
        joining_player: user_id,
      });
      // match current player with waiting player
      this.matchPlayers(waiting_player.socket, client);
    } else {
      waiting_player = { user_id, socket: client };
      console.log(`User ${user_id} is waiting for another player`);
    }
  }

  @SubscribeMessage('invite')
  @UseGuards(PongGuard)
  async invitePlayer(client: WebSocket, data: string) {
    const user_id = connected_users.get(client);

    const invited_user_id = +data;
    if (
      !invited_user_id ||
      invited_user_id === user_id ||
      !(await this.usersService.findById(invited_user_id))
    ) {
      console.log('invalid invited_user_id');
      return;
    }
    // insert invitation in the map (new invitation overwrites an old one)
    invitations.set(user_id, invited_user_id);
    console.log(`User ${user_id} is waiting for User ${invited_user_id}`);

    // notify user via ws
    this.wsService.sendMsgToUser(invited_user_id, {
      event: 'pong: invitation',
      user_id,
    });
  }

  @SubscribeMessage('accept')
  @UseGuards(PongGuard)
  acceptInvitation(client: WebSocket, data: string) {
    const user_id = connected_users.get(client);
    const inviting_user_id = +data;
    if (!inviting_user_id) {
      console.log('invalid inviting_user_id');
      return;
    }
    // check if invitation exists
    if (invitations.get(inviting_user_id) !== user_id) {
      console.log('Invitation does not exist');
      // client.close(1000, 'Invitation does not exist');
      return;
    }
    // get inviting user socket
    const inviting_user_socket = getSocketFromUser(inviting_user_id);
    if (!inviting_user_socket) {
      console.log('inviting user is no longer available');
      // client.close(1000, 'inviting user is no longer available');
      return;
    }
    // notify inviting user
    this.wsService.sendMsgToUser(inviting_user_id, {
      event: 'pong: invitation_accepted',
      user_id,
    });

    // start game
    this.matchPlayers(inviting_user_socket, client);
  }

  @SubscribeMessage('cancel')
  @UseGuards(PongGuard)
  clear(client: WebSocket) {
    const user_id = connected_users.get(client);
    clearInviteWait(user_id);
    console.log(`User ${user_id} cleared as waiting player or inviting player`);
  }

  // starts session and calls linkPlayers
  matchPlayers(p1Socket: WebSocket, p2Socket: WebSocket) {
    const p1 = connected_users.get(p1Socket);
    const p2 = connected_users.get(p2Socket);

    const id = startSession(p1Socket, p2Socket);

    // notify new game session
    this.wsService.sendMsgToAll({
      event: `pong: new_session`,
      session_id: id,
    });

    // no longer waiting for a peer
    clearInviteWait(p1);
    clearInviteWait(p2);

    // update status
    playing.add(p1);
    playing.add(p2);

    // notify friends
    this.wsService.notifyStatusChangeToFriendsWsessionId(p1, {
      sessionId: id,
      status: 'playing',
    });
    this.wsService.notifyStatusChangeToFriendsWsessionId(p2, {
      sessionId: id,
      status: 'playing',
    });

    linkPlayers(id).then(async (playerScores: playerScoresInterface) => {
      console.log(
        `Session ${id} ended with scores: p1 ${playerScores.p1Score}, p2 ${playerScores.p2Score}`,
      );

      // update status
      playing.delete(p1);
      playing.delete(p2);

      // notify friends
      this.wsService.notifyStatusToFriendsAuto(p1);
      this.wsService.notifyStatusToFriendsAuto(p2);

      // save score in match history (if complete)
      if (playerScores.p1Score === 10 || playerScores.p2Score === 10) {
        await this.statsService.insertMatch(
          p1,
          p2,
          playerScores.p1Score,
          playerScores.p2Score,
        );
        // notify everyone about ladder change
        this.wsService.sendMsgToAll({
          event: `ladder_change`,
          ladder: await this.statsService.ladder(),
        });

        this.wsService.sendMsgToAll({
          event: `pong: session_over`,
          session_id: id,
        });
      }
    });
  }
}

@WebSocketGateway({ path: '/pong_viewer' })
export class PongViewerGateway implements OnGatewayInit {
  afterInit(wss: WSS) {
    wss.on('connection', (ws: WebSocket) => {
      console.log('new viewer connected to server');
      viewerSockets.push({ id: -1, ws: ws });
      ws.send(JSON.stringify(defaultVals)); //sending viewer the default values
      ws.on('error', (e) => console.error(`viewer socket error: ${e.message}`));
      ws.on('close', () => {
        const i: number = viewerSockets.findIndex(
          (s: { id: number; ws: any }) => s.ws === ws,
        );
        console.log(
          `viewer socket leaving game session ${viewerSockets[i].id}`,
        );
        viewerSockets.splice(i, 1);
      });
      ws.on('message', (data: any) => {
        const ob: any = JSON.parse(String(data));
        const i: number = viewerSockets.findIndex(
          (s: { id: number; ws: any }) => s.ws === ws,
        );
        // if viewer wants to get the ongoing sessions
        if (ob.requestSessions === true) {
          const sessionIdsArray: number[] = [];
          sockets.forEach((s: gameSocketsInterface) => {
            if (!sessionIdsArray.includes(s.id)) sessionIdsArray.push(s.id);
          });
          ws.send(JSON.stringify({ sessionIdsArray: sessionIdsArray }));
        }
        // if the viewer wants to change session (id is guaranteed to be valid)
        if (ob.id !== undefined) {
          console.log(`setting id ${ob.id} to viewer socket`);
          viewerSockets[i].id = ob.id;
        }
      });
    });
  }
}

function removeGameSession(ws: WebSocket) {
  const i = sockets.findIndex((s) => s.p1Socket === ws || s.p2Socket === ws);
  if (i === -1) return; // Rodolpho added this line
  if (sockets[i].p1Socket === ws) {
    sockets[i].p1Socket = undefined;
    console.log(`p1 of session ${sockets[i].id} left`);
    if (sockets[i].p2Socket) {
      console.log(`closing connection with p2 of session ${sockets[i].id}...`);
      sockets[i].p2Socket.close();
    } else sockets.splice(i, 1); // deleting game session from array
  } else {
    sockets[i].p2Socket = undefined;
    console.log(`p2 of session ${sockets[i].id} left`);
    if (sockets[i].p1Socket) {
      console.log(`closing connection with p1 of session ${sockets[i].id}...`);
      sockets[i].p1Socket.close();
    } else sockets.splice(i, 1); // deleting game session from array
  }
}

//function to execute right after second player has been connected
async function linkPlayers(id: number) {
  const gameSockets: gameSocketsInterface = sockets.find((s) => id === s.id);
  console.log(`linking players for session ${id}`);
  gameSockets.p1Socket.on(
    'message',
    (data: any) => (gameSockets.p1Ob = JSON.parse(String(data))),
  );
  gameSockets.p2Socket.on(
    'message',
    (data: any) => (gameSockets.p2Ob = JSON.parse(String(data))),
  );
  //players will automatically start after receiving their number
  gameSockets.p1Socket.send(
    JSON.stringify({ ...defaultVals, playerNumber: 1 }),
  ); //sending players their number
  gameSockets.p2Socket.send(
    JSON.stringify({ ...defaultVals, playerNumber: 2 }),
  ); //and default values
  return await startGame(id);
}

//game loop
async function startGame(id: number) {
  console.log(`creating new game session ${id}`); // compute values will create the game session for the id the first time it's called
  const playerScores: playerScoresInterface = { p1Score: 0, p2Score: 0 };
  const gameSockets: gameSocketsInterface = sockets.find((s) => id === s.id);
  const minUpdateTime = 20; //ms (higher -> laggier, lower -> heavier for the bandwidth)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); //function used to sleep
  let deltaTime = 0.1; //dummy value for the very first frame
  let ob: any = {};
  while (1) {
    const beginTime = performance.now();
    //getting object to send to players/viewers
    ob = computeValues(
      gameSockets.p1Ob,
      gameSockets.p2Ob,
      deltaTime,
      gameSockets.id,
    );
    //updating startGame's return value
    if (ob.p1Score !== undefined) playerScores.p1Score = ob.p1Score;
    if (ob.p2Score !== undefined) playerScores.p2Score = ob.p2Score;
    //sending data
    if (gameSockets.p1Socket) gameSockets.p1Socket.send(JSON.stringify(ob));
    else break;
    if (gameSockets.p2Socket) gameSockets.p2Socket.send(JSON.stringify(ob));
    else break;
    viewerSockets.forEach((s) => {
      if (s.id === gameSockets.id) s.ws.send(JSON.stringify(ob));
    });
    if (ob.playerWon !== undefined && ob.playerWon !== 0) break; // 1 if p1 won, 2 if p2 won, 0 if no one won yet
    //trying to avoid DDOSing my clients by waiting a little bit (if the loop is too fast)
    const execTime = performance.now() - beginTime;
    await delay(minUpdateTime > execTime ? minUpdateTime - execTime : 0);
    deltaTime = (performance.now() - beginTime) / 1000;
  }
  console.log(`deleting session ${id}`);
  deleteGameSession(gameSockets.id);
  ///// Rodolpho added these lines: remove session from sockets array
  const session_idx = sockets.findIndex((val) => val.id === id);
  if (session_idx >= 0) sockets.splice(session_idx, 1);
  //////
  viewerSockets.forEach((s) => {
    if (s.id === gameSockets.id) {
      s.id = -1;
      s.ws.send(
        JSON.stringify({
          ...ob, // viewers need the final game state
          gameFinished: true, // to notify the viwers that the game has ended/was interrupted
        }),
      );
    }
  });
  return playerScores; // contains the final score of the game
}

function generateSessionId(): number {
  const id: number =
    sockets.reduce((prev, cur) => (prev.id < cur.id ? cur : prev), { id: 0 })
      .id + 1;
  return id;
}

function getSocketFromUser(user_id: number) {
  for (const [key, value] of connected_users.entries()) {
    if (value === user_id) return key;
  }
}

function clearInviteWait(user_id: number) {
  invitations.delete(user_id);
  if (waiting_player?.user_id === user_id) waiting_player = null;
}

function startSession(p1Socket: WebSocket, p2Socket: WebSocket) {
  const id = generateSessionId();
  sockets.push({
    id,
    p1Socket,
    p2Socket,
    p1Ob: {},
    p2Ob: {},
  });
  return id;
}
