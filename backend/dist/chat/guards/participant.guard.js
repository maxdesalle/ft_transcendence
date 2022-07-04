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
exports.RoomGuard = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("../chat.service");
let RoomGuard = class RoomGuard {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        let room_id = +request.params.room_id;
        if (!room_id)
            room_id = request.body.room_id;
        const rooms = await this.chatService.listRooms();
        if (!rooms.includes(room_id))
            throw new common_1.BadRequestException("invalid room_id...");
        const participants = await this.chatService.listRoomParticipants(room_id);
        return participants.includes(user.id);
    }
};
RoomGuard = __decorate([
    __param(0, (0, common_1.Inject)(chat_service_1.ChatService)),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], RoomGuard);
exports.RoomGuard = RoomGuard;
//# sourceMappingURL=participant.guard.js.map