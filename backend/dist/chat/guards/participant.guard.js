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
exports.RoomGuard = exports.IsParticipant = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const chat_service_1 = require("../chat.service");
const ws_service_1 = require("../../ws/ws.service");
let IsParticipant = class IsParticipant {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const room_id = request.params.room_id;
        const participants = await this.chatService.getRoomParcipants(room_id);
        return participants.includes(user.id);
    }
};
IsParticipant = __decorate([
    __param(0, (0, common_1.Inject)(chat_service_1.ChatService)),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], IsParticipant);
exports.IsParticipant = IsParticipant;
let RoomGuard = class RoomGuard {
    constructor(chatService, wsAuthService) {
        this.chatService = chatService;
        this.wsAuthService = wsAuthService;
    }
    async canActivate(context) {
        var _a;
        const ctx = context.switchToWs();
        const socket = ctx.getClient();
        const user = this.wsAuthService.getUserFromSocket(socket);
        const room_id = +((_a = ctx.getData()) === null || _a === void 0 ? void 0 : _a.room_id);
        if (!room_id)
            throw new websockets_1.WsException('missing room_id');
        const participants = await this.chatService.getRoomParcipants(room_id);
        if (!participants.includes(user))
            throw new websockets_1.WsException('user is not a member of this room');
        return true;
    }
};
RoomGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        ws_service_1.WsService])
], RoomGuard);
exports.RoomGuard = RoomGuard;
//# sourceMappingURL=participant.guard.js.map