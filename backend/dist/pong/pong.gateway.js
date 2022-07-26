"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PongViewerGateway = exports.PongGateway = exports.playing = exports.connected_users = void 0;
const websockets_1 = require("@nestjs/websockets");
const ws_1 = require("ws");
const computeValues_1 = require("./computeValues");
const defaultVals_1 = require("./defaultVals");
const cookie_1 = require("cookie");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const ws_service_1 = require("../ws/ws.service");
const common_1 = require("@nestjs/common");
const stats_service_1 = require("../stats/stats.service");
const pong_guard_1 = require("./guards/pong.guard");
const defaultVals = defaultVals_1.default_values.df;
;
const viewerSockets = [];
;
const sockets = [];
exports.connected_users = new Map();
const invitations = new Map();
let waiting_player = null;
exports.playing = new Set();
let PongGateway = class PongGateway {
    constructor(jwtService, usersService, wsService, statsService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.wsService = wsService;
        this.statsService = statsService;
    }
    handleConnection(ws, req) {
        let user;
        try {
            const token = (0, cookie_1.parse)(req.headers.cookie)['jwt_token'];
            user = this.jwtService.verify(token);
        }
        catch (error) {
            ws.close(1008, 'Bad credentials');
            console.log('Authentication failed');
            return;
        }
        exports.connected_users.set(ws, user.id);
        console.log(`User ${user.id} connected to pong WSS`);
        ws.on('error', (e) => console.error(`socket error: ${e.message}`));
    }
    handleDisconnect(client) {
        const user_id = exports.connected_users.get(client);
        exports.connected_users.delete(client);
        clearInviteWait(user_id);
        removeGameSession(client);
        if (user_id)
            console.log(`User ${user_id} disconnected`);
    }
    playAgainstAnyone(client, data) {
        const user_id = exports.connected_users.get(client);
        if (waiting_player) {
            this.matchPlayers(waiting_player.socket, client);
        }
        else {
            waiting_player = { user_id, socket: client };
            console.log(`User ${user_id} is waiting for another player`);
        }
    }
    async invitePlayer(client, data) {
        const user_id = exports.connected_users.get(client);
        const invited_user_id = +data;
        if (!invited_user_id || invited_user_id === user_id
            || !await this.usersService.findById(invited_user_id)) {
            console.log('invalid invited_user_id');
            return;
        }
        invitations.set(user_id, invited_user_id);
        console.log(`User ${user_id} is waiting for User ${invited_user_id}`);
        this.wsService.sendMsgToUser(invited_user_id, {
            event: 'pong: invitation',
            user_id
        });
    }
    acceptInvitation(client, data) {
        const user_id = exports.connected_users.get(client);
        const inviting_user_id = +data;
        if (!inviting_user_id) {
            console.log('invalid inviting_user_id');
            return;
        }
        if (invitations.get(inviting_user_id) !== user_id) {
            console.log('Invitation does not exist');
            return;
        }
        const inviting_user_socket = getSocketFromUser(inviting_user_id);
        if (!inviting_user_socket) {
            console.log('inviting user is no longer available');
            return;
        }
        this.wsService.sendMsgToUser(inviting_user_id, {
            event: 'pong: invitation_accepted',
            user_id
        });
        this.matchPlayers(inviting_user_socket, client);
    }
    clear(client, data) {
        const user_id = exports.connected_users.get(client);
        clearInviteWait(user_id);
        console.log(`User ${user_id} cleared as waiting player or inviting player`);
    }
    matchPlayers(p1Socket, p2Socket) {
        const p1 = exports.connected_users.get(p1Socket);
        const p2 = exports.connected_users.get(p2Socket);
        const id = startSession(p1Socket, p2Socket);
        clearInviteWait(p1);
        clearInviteWait(p2);
        exports.playing.add(p1);
        exports.playing.add(p2);
        this.wsService.notifyStatusChangeToFriends(p1, 'playing');
        this.wsService.notifyStatusChangeToFriends(p2, 'playing');
        linkPlayers(id).then(async (playerScores) => {
            console.log(`Session ${id} ended with scores: p1 ${playerScores.p1Score}, p2 ${playerScores.p2Score}`);
            exports.playing.delete(p1);
            exports.playing.delete(p2);
            this.wsService.notifyStatusToFriendsAuto(p1);
            this.wsService.notifyStatusToFriendsAuto(p2);
            if (playerScores.p1Score === 10 || playerScores.p2Score === 10) {
                this.statsService.insertMatch(p1, p2, playerScores.p1Score, playerScores.p2Score);
                this.wsService.sendMsgToAll({
                    event: `ladder_change`,
                    ladder: await this.statsService.ladder()
                });
            }
        });
    }
};
__decorate([
    (0, websockets_1.SubscribeMessage)('play'),
    (0, common_1.UseGuards)(pong_guard_1.PongGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ws_1.WebSocket, String]),
    __metadata("design:returntype", void 0)
], PongGateway.prototype, "playAgainstAnyone", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('invite'),
    (0, common_1.UseGuards)(pong_guard_1.PongGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ws_1.WebSocket, String]),
    __metadata("design:returntype", Promise)
], PongGateway.prototype, "invitePlayer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('accept'),
    (0, common_1.UseGuards)(pong_guard_1.PongGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ws_1.WebSocket, String]),
    __metadata("design:returntype", void 0)
], PongGateway.prototype, "acceptInvitation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('cancel'),
    (0, common_1.UseGuards)(pong_guard_1.PongGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ws_1.WebSocket, String]),
    __metadata("design:returntype", void 0)
], PongGateway.prototype, "clear", null);
PongGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ path: '/pong' }),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => ws_service_1.WsService))),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        ws_service_1.WsService,
        stats_service_1.StatsService])
], PongGateway);
exports.PongGateway = PongGateway;
let PongViewerGateway = class PongViewerGateway {
    afterInit(wss) {
        wss.on('connection', (ws) => {
            console.log('new viewer connected to server');
            viewerSockets.push({ id: -1, ws: ws });
            ws.send(JSON.stringify(defaultVals));
            ws.on('error', (e) => console.error(`viewer socket error: ${e.message}`));
            ws.on('close', () => {
                const i = viewerSockets.findIndex((s) => s.ws === ws);
                console.log(`viewer socket leaving game session ${viewerSockets[i].id}`);
                viewerSockets.splice(i, 1);
            });
            ws.on('message', (data) => {
                const ob = JSON.parse(String(data));
                const i = viewerSockets.findIndex((s) => s.ws === ws);
                if (ob.requestSessions === true) {
                    const sessionIdsArray = [];
                    sockets.forEach((s) => {
                        if (!sessionIdsArray.includes(s.id))
                            sessionIdsArray.push(s.id);
                    });
                    ws.send(JSON.stringify({ sessionIdsArray: sessionIdsArray }));
                }
                if (ob.id !== undefined) {
                    console.log(`setting id ${ob.id} to viewer socket`);
                    viewerSockets[i].id = ob.id;
                }
            });
        });
    }
};
PongViewerGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ path: '/pong_viewer' })
], PongViewerGateway);
exports.PongViewerGateway = PongViewerGateway;
function removeGameSession(ws) {
    const i = sockets.findIndex((s) => (s.p1Socket === ws || s.p2Socket === ws));
    if (i === -1)
        return;
    if (sockets[i].p1Socket === ws) {
        sockets[i].p1Socket = undefined;
        console.log(`p1 of session ${sockets[i].id} left`);
        if (sockets[i].p2Socket) {
            console.log(`closing connection with p2 of session ${sockets[i].id}...`);
            sockets[i].p2Socket.close();
        }
        else
            sockets.splice(i, 1);
    }
    else {
        sockets[i].p2Socket = undefined;
        console.log(`p2 of session ${sockets[i].id} left`);
        if (sockets[i].p1Socket) {
            console.log(`closing connection with p1 of session ${sockets[i].id}...`);
            sockets[i].p1Socket.close();
        }
        else
            sockets.splice(i, 1);
    }
}
async function linkPlayers(id) {
    const gameSockets = sockets.find((s) => id === s.id);
    console.log(`linking players for session ${id}`);
    gameSockets.p1Socket.on('message', (data) => gameSockets.p1Ob = JSON.parse(String(data)));
    gameSockets.p2Socket.on('message', (data) => gameSockets.p2Ob = JSON.parse(String(data)));
    gameSockets.p1Socket.send(JSON.stringify(Object.assign(Object.assign({}, defaultVals), { playerNumber: 1 })));
    gameSockets.p2Socket.send(JSON.stringify(Object.assign(Object.assign({}, defaultVals), { playerNumber: 2 })));
    return await startGame(id);
}
async function startGame(id) {
    console.log(`creating new game session ${id}`);
    const playerScores = { p1Score: 0, p2Score: 0 };
    const gameSockets = sockets.find((s) => id === s.id);
    const minUpdateTime = 20;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let deltaTime = 0.1;
    let ob = {};
    while (1) {
        const beginTime = performance.now();
        ob = (0, computeValues_1.computeValues)(gameSockets.p1Ob, gameSockets.p2Ob, deltaTime, gameSockets.id);
        if (ob.p1Score !== undefined)
            playerScores.p1Score = ob.p1Score;
        if (ob.p2Score !== undefined)
            playerScores.p2Score = ob.p2Score;
        if (gameSockets.p1Socket)
            gameSockets.p1Socket.send(JSON.stringify(ob));
        else
            break;
        if (gameSockets.p2Socket)
            gameSockets.p2Socket.send(JSON.stringify(ob));
        else
            break;
        viewerSockets.forEach((s) => {
            if (s.id === gameSockets.id)
                s.ws.send(JSON.stringify(ob));
        });
        if (ob.playerWon !== undefined && ob.playerWon !== 0)
            break;
        const execTime = performance.now() - beginTime;
        await delay(minUpdateTime > execTime ? minUpdateTime - execTime : 0);
        deltaTime = (performance.now() - beginTime) / 1000.;
    }
    console.log(`deleting session ${id}`);
    (0, computeValues_1.deleteGameSession)(gameSockets.id);
    viewerSockets.forEach((s) => {
        if (s.id === gameSockets.id) {
            s.id = -1;
            s.ws.send(JSON.stringify(Object.assign(Object.assign({}, ob), { gameFinished: true })));
        }
        ;
    });
    return playerScores;
}
function generateSessionId() {
    const id = (sockets.reduce((prev, cur) => prev.id < cur.id ? cur : prev, { id: 0 })).id + 1;
    return id;
}
function getSocketFromUser(user_id) {
    for (let [key, value] of exports.connected_users.entries()) {
        if (value === user_id)
            return key;
    }
}
function clearInviteWait(user_id) {
    invitations.delete(user_id);
    if ((waiting_player === null || waiting_player === void 0 ? void 0 : waiting_player.user_id) === user_id)
        waiting_player = null;
}
function startSession(p1Socket, p2Socket) {
    const id = generateSessionId();
    sockets.push({
        id,
        p1Socket,
        p2Socket,
        p1Ob: {},
        p2Ob: {}
    });
    return (id);
}
//# sourceMappingURL=pong.gateway.js.map