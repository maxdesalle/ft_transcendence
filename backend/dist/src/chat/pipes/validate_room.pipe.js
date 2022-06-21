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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateRoomPipeWS = exports.ValidateRoomPipe = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const chat_service_1 = require("../chat.service");
let ValidateRoomPipe = class ValidateRoomPipe {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async transform(value, metadata) {
        const rooms = await this.chatService.getRoomsList();
        if (!rooms.includes(value))
            throw new common_1.BadRequestException("invalid room_id");
        return value;
    }
};
ValidateRoomPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ValidateRoomPipe);
exports.ValidateRoomPipe = ValidateRoomPipe;
let ValidateRoomPipeWS = class ValidateRoomPipeWS {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async transform(value, metadata) {
        const rooms = await this.chatService.getRoomsList();
        if (!rooms.includes(value))
            throw new websockets_1.WsException("invalid room_id");
        return value;
    }
};
ValidateRoomPipeWS = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ValidateRoomPipeWS);
exports.ValidateRoomPipeWS = ValidateRoomPipeWS;
//# sourceMappingURL=validate_room.pipe.js.map