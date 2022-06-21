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
exports.FriendsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_decorator_1 = require("../users/decorators/user.decorator");
const ws_service_1 = require("../ws/ws.service");
const friendReq_dto_1 = require("./dto/friendReq.dto");
const friendship_entity_1 = require("./entities/friendship.entity");
const friends_service_1 = require("./friends.service");
let FriendsController = class FriendsController {
    constructor(friendsService, wsService) {
        this.friendsService = friendsService;
        this.wsService = wsService;
    }
    async addFriend(me, user_id, _body) {
        const friend_request = await this.friendsService.requestFriendship(me.id, user_id);
        const response = {
            event: 'friends: new_request',
            friend_request
        };
        this.wsService.sendMsgToUser(user_id, response);
        return response;
    }
    async acceptFriend(me, user_id, _body) {
        const friend_request = await this.friendsService
            .setFriendshipStatus(me.id, user_id, friendship_entity_1.FrienshipStatus.accepted);
        const response = {
            event: 'friends: request_accepted',
            friend_request
        };
        this.wsService.sendMsgToUser(user_id, response);
        return response;
    }
    async rejectFriend(me, user_id, _body) {
        const friend_request = await this.friendsService
            .setFriendshipStatus(me.id, user_id, friendship_entity_1.FrienshipStatus.rejected);
        const response = {
            event: 'friends: request_rejected',
            friend_request
        };
        this.wsService.sendMsgToUser(user_id, response);
        return response;
    }
    getPendingSent(me) {
        return this.friendsService.pendingSentRequests(me.id);
    }
    getPendingReceived(me) {
        return this.friendsService.pendingReceivedRequests(me.id);
    }
    listRejectedFriends(me) {
        return this.friendsService.rejectedReceivedRequests(me.id);
    }
    listFriendsIds(me) {
        return this.friendsService.listFriendsIDs(me.id);
    }
    listFriendsUsers(me) {
        return this.friendsService.listFriendsUsers(me.id);
    }
};
__decorate([
    (0, common_1.Post)('send_friend_request'),
    openapi.ApiResponse({ status: 201, type: require("./dto/friendReq.dto").friendReqEventDto }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('user_id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, friendReq_dto_1.friendRequestDto]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "addFriend", null);
__decorate([
    (0, common_1.Post)('accept_friend_request'),
    openapi.ApiResponse({ status: 201, type: require("./dto/friendReq.dto").friendReqEventDto }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('user_id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, friendReq_dto_1.friendRequestDto]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "acceptFriend", null);
__decorate([
    (0, common_1.Post)('reject_friend_request'),
    (0, swagger_1.ApiResponse)({ description: 'list of friends user_ids' }),
    openapi.ApiResponse({ status: 201, type: require("./dto/friendReq.dto").friendReqEventDto }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('user_id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, friendReq_dto_1.friendRequestDto]),
    __metadata("design:returntype", Promise)
], FriendsController.prototype, "rejectFriend", null);
__decorate([
    (0, common_1.Get)('pending_sent'),
    (0, swagger_1.ApiOperation)({ summary: "friendship requests SENT by you that are pending of the other user's approval" }),
    (0, swagger_1.ApiResponse)({ description: 'list of user_ids' }),
    openapi.ApiResponse({ status: 200, type: [Number] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FriendsController.prototype, "getPendingSent", null);
__decorate([
    (0, common_1.Get)('pending_received'),
    (0, swagger_1.ApiOperation)({ summary: 'friendship requests RECEIVED by you that are pending of your approval' }),
    (0, swagger_1.ApiResponse)({ description: 'list of user_ids' }),
    openapi.ApiResponse({ status: 200, type: [Number] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FriendsController.prototype, "getPendingReceived", null);
__decorate([
    (0, common_1.Get)('rejected_received'),
    (0, swagger_1.ApiOperation)({ summary: 'friendship requests RECEIVED and rejected BY YOU' }),
    (0, swagger_1.ApiResponse)({ description: 'list of user_ids' }),
    openapi.ApiResponse({ status: 200, type: [Number] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FriendsController.prototype, "listRejectedFriends", null);
__decorate([
    (0, common_1.Get)('id'),
    (0, swagger_1.ApiOperation)({ summary: "your friends' user_id" }),
    (0, swagger_1.ApiResponse)({ description: 'list of user_ids' }),
    openapi.ApiResponse({ status: 200, type: [Number] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FriendsController.prototype, "listFriendsIds", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: "your friends' User object (more info than just ID)" }),
    (0, swagger_1.ApiResponse)({ description: 'list of Users' }),
    openapi.ApiResponse({ status: 200, type: [require("../users/entities/user.entity").User] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FriendsController.prototype, "listFriendsUsers", null);
FriendsController = __decorate([
    (0, common_1.Controller)('friends'),
    (0, swagger_1.ApiTags)('friends'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [friends_service_1.FriendsService,
        ws_service_1.WsService])
], FriendsController);
exports.FriendsController = FriendsController;
//# sourceMappingURL=friends.controller.js.map