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
var WsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const cookie_1 = require("cookie");
const friends_service_1 = require("../friends/friends.service");
let WsService = WsService_1 = class WsService {
    constructor(jwtService, friendsService) {
        this.jwtService = jwtService;
        this.friendsService = friendsService;
    }
    getUserFromUpgradeRequest(req) {
        const token = (0, cookie_1.parse)(req.headers.cookie)['jwt_token'];
        const user = this.jwtService.verify(token);
        return (user);
    }
    getUserFromSocket(socket) {
        for (let [key, value] of WsService_1.connected_users.entries()) {
            if (value === socket)
                return key;
        }
    }
    getConnectedUsersIDs() {
        const list = [];
        for (const key of WsService_1.connected_users.keys())
            list.push(key);
        return list;
    }
    isUserOnline(user_id) {
        return WsService_1.connected_users.has(user_id);
    }
    setUserOnline(user_id, socket) {
        WsService_1.connected_users.set(user_id, socket);
    }
    setUserOffline(user_id) {
        return WsService_1.connected_users.delete(user_id);
    }
    sendMsgToUser(user_id, data) {
        if (WsService_1.connected_users.has(user_id))
            WsService_1.connected_users.get(user_id)
                .send(JSON.stringify(data));
    }
    sendMsgToUsersList(users, data) {
        for (const user_id of users) {
            this.sendMsgToUser(user_id, data);
        }
    }
    async notifyStatusChangeToFriends(user_id, status) {
        const friends = await this.friendsService.listFriendsIDs(user_id);
        this.sendMsgToUsersList(friends, {
            event: `status: friend_${status}`,
            user_id
        });
    }
    async notifyStatusToFriendsAuto(user_id) {
        const status = this.friendsService.getUserStatus(user_id);
        const friends = await this.friendsService.listFriendsIDs(user_id);
        this.sendMsgToUsersList(friends, {
            event: `status: friend_${status}`,
            user_id
        });
    }
};
WsService.connected_users = new Map();
WsService = WsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => friends_service_1.FriendsService))),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        friends_service_1.FriendsService])
], WsService);
exports.WsService = WsService;
//# sourceMappingURL=ws.service.js.map