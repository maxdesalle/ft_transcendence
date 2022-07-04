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
exports.ChatController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_decorator_1 = require("../users/decorators/user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const ws_service_1 = require("../ws/ws.service");
const chat_service_1 = require("./chat.service");
const chat_dto_1 = require("./DTO/chat.dto");
const validate_room_pipe_1 = require("./pipes/validate_room.pipe");
const validate_user_pipe_1 = require("./pipes/validate_user.pipe");
let ChatController = class ChatController {
    constructor(chatService, wsService) {
        this.chatService = chatService;
        this.wsService = wsService;
    }
    async postDM(me, destUserId, body) {
        const message = await this.chatService.postDM(me, destUserId, body.message);
        this.wsService.sendMsgToUsersList([me.id, destUserId], {
            event: 'chat_dm',
            message
        });
        return message;
    }
    async getDMs(me, user_id) {
        return this.chatService.getDMbyUser(me, user_id);
    }
    async blockUser(me, blocked_id, _body) {
        await this.chatService.block_user(me, blocked_id);
        return this.chatService.listBlockedUsers(me.id);
    }
    async unblockUser(me, blocked_id, _body) {
        await this.chatService.unblock_user(me, blocked_id);
        return this.chatService.listBlockedUsers(me.id);
    }
    checkBlocked(user) {
        return this.chatService.listBlockedUsers(user.id);
    }
    async getPublicRooms() {
        return await this.chatService.showPublicRooms();
    }
    async join_group(me, room_id, password, _room) {
        await this.chatService.join_public_group(me, room_id, password);
        return this.chatService.roomInfo(room_id);
    }
    async leave(me, room_id, _room) {
        await this.chatService.leave_group(me, room_id);
        return this.getConvs(me);
    }
    async postGroupMsg(me, room_id, body) {
        const message = await this.chatService.postGroupMsg(me, room_id, body.message);
        this.wsService.sendMsgToUsersList(await this.chatService.listRoomParticipants(room_id), { event: 'chat_room_msg', message });
        return message;
    }
    async getGroupMessages(me, room_id) {
        return this.chatService.getGroupMessages(me, room_id);
    }
    async createGroup(me, group_config) {
        const room_id = await this.chatService.create_group(me, group_config);
        this.wsService.sendMsgToUser(me.id, {
            event: 'chat_new_group',
            room_id
        });
        return this.chatService.get_convs(me);
    }
    async removeGroup(me, room_id, _body) {
        await this.chatService.rm_group(me, room_id);
        return this.chatService.get_convs(me);
    }
    async addGroupUser(me, room_id, user_id, _body) {
        await this.chatService.addGroupUser(me, room_id, user_id);
        this.wsService.sendMsgToUser(user_id, {
            event: 'chat_new_group',
            room_id
        });
        this.wsService.sendMsgToUsersList(await this.chatService.listRoomParticipants(room_id), {
            event: 'chat_new_user_in_group',
            room_id,
            user_id
        });
        return this.chatService.roomInfo(room_id);
    }
    async addGroupUserbyName(me, room_id, user_id, _body) {
        return this.addGroupUser(me, room_id, user_id);
    }
    async banUser(me, room_id, user_id, ban_minutes, _body) {
        await this.chatService.ban_group_user(me, room_id, user_id, ban_minutes);
        return this.chatService.roomInfo(room_id);
    }
    async unbanUser(me, room_id, user_id, _body) {
        await this.chatService.unban_group_user(me, room_id, user_id);
        return this.chatService.roomInfo(room_id);
    }
    async mute(me, room_id, user_id, mute_minutes, _body) {
        await this.chatService.mute_user(me, room_id, user_id, mute_minutes);
        return this.chatService.roomInfo(room_id);
    }
    async unmute(me, room_id, user_id, _body) {
        await this.chatService.unmute_user(me, room_id, user_id);
        return this.chatService.roomInfo(room_id);
    }
    async promote(me, room_id, user_id, _body) {
        await this.chatService.add_admin_group(me, room_id, user_id);
        return this.chatService.roomInfo(room_id);
    }
    async demote(me, room_id, user_id, _body) {
        await this.chatService.rm_admin_group(me, room_id, user_id);
        return this.chatService.roomInfo(room_id);
    }
    async set_pswd(me, room_id, body) {
        await this.chatService.set_password(me, room_id, body.password);
        return `new password set for room ${room_id}`;
    }
    async set_private(me, room_id, body) {
        await this.chatService.set_private(me, room_id, body.private);
        return this.chatService.roomInfo(room_id);
    }
    async set_owner(me, room_id, user_id, _body) {
        await this.chatService.set_owner(me, room_id, user_id);
        return this.chatService.roomInfo(room_id);
    }
    groupInfo(room_id) {
        return this.chatService.roomInfo(room_id);
    }
    getConvs(user) {
        return this.chatService.get_convs(user);
    }
    async postMsgToRoom(me, room_id, body) {
        if (await this.chatService.isGroupRoom(room_id))
            return this.postGroupMsg(me, room_id, body);
        const message = await this.chatService.postDMbyRoomId(me, room_id, body.message);
        this.wsService.sendMsgToUsersList(await this.chatService.listRoomParticipants(room_id), { event: 'chat_dm', message });
        return message;
    }
    async getMessagesByRoomId(me, room_id) {
        if (await this.chatService.isGroupRoom(room_id))
            return this.getGroupMessages(me, room_id);
        return this.chatService.getDMsByRoomID(me, room_id);
    }
};
__decorate([
    (0, common_1.Post)('dm'),
    (0, swagger_1.ApiTags)('chat - DM'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").MessageDTO }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('user_id', common_1.ParseIntPipe, validate_user_pipe_1.ValidateUserPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.PostDmDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "postDM", null);
__decorate([
    (0, common_1.Get)('dm/:user_id'),
    (0, swagger_1.ApiTags)('chat - DM'),
    openapi.ApiResponse({ status: 200, type: [require("./DTO/chat.dto").MessageDTO] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Param)('user_id', common_1.ParseIntPipe, validate_user_pipe_1.ValidateUserPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getDMs", null);
__decorate([
    (0, common_1.Post)('block'),
    (0, swagger_1.ApiTags)('chat - DM'),
    (0, swagger_1.ApiResponse)({ description: 'list of users that you blocked + blocked you' }),
    openapi.ApiResponse({ status: 201, type: [Number] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('user_id', common_1.ParseIntPipe, validate_user_pipe_1.ValidateUserPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "blockUser", null);
__decorate([
    (0, common_1.Post)('unblock'),
    (0, swagger_1.ApiTags)('chat - DM'),
    (0, swagger_1.ApiResponse)({ description: 'list of users that you blocked + blocked you' }),
    openapi.ApiResponse({ status: 201, type: [Number] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('user_id', common_1.ParseIntPipe, validate_user_pipe_1.ValidateUserPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.UserIdDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "unblockUser", null);
__decorate([
    (0, common_1.Get)('blocked'),
    (0, swagger_1.ApiTags)('chat - DM'),
    (0, swagger_1.ApiResponse)({ description: 'list of users that you blocked + blocked you' }),
    openapi.ApiResponse({ status: 200, type: [Number] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ChatController.prototype, "checkBlocked", null);
__decorate([
    (0, common_1.Get)('public_groups'),
    (0, swagger_1.ApiTags)('chat - groups'),
    openapi.ApiResponse({ status: 200, type: [require("./DTO/chat.dto").RoomInfo] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getPublicRooms", null);
__decorate([
    (0, common_1.Post)('join_group'),
    (0, swagger_1.ApiTags)('chat - groups'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('password')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, String, chat_dto_1.RoomAndPasswordDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "join_group", null);
__decorate([
    (0, common_1.Post)('leave_group'),
    (0, swagger_1.ApiTags)('chat - groups'),
    openapi.ApiResponse({ status: 201, type: [require("./DTO/chat.dto").RoomInfoShort] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.RoomIdDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "leave", null);
__decorate([
    (0, common_1.Post)('group_message'),
    (0, swagger_1.ApiTags)('chat - groups'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").MessageDTO }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.Message2RoomDTO]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "postGroupMsg", null);
__decorate([
    (0, common_1.Get)('group_messages/:room_id'),
    (0, swagger_1.ApiTags)('chat - groups'),
    openapi.ApiResponse({ status: 200, type: [require("./DTO/chat.dto").MessageDTO] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Param)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getGroupMessages", null);
__decorate([
    (0, common_1.Post)('create_group'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: [require("./DTO/chat.dto").RoomInfoShort] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        chat_dto_1.GroupConfigDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)('rm_group'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: [require("./DTO/chat.dto").RoomInfoShort] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.RoomIdDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "removeGroup", null);
__decorate([
    (0, common_1.Post)('add_group_user'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_id', common_1.ParseIntPipe, validate_user_pipe_1.ValidateUserPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, chat_dto_1.RoomAndUserDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addGroupUser", null);
__decorate([
    (0, common_1.Post)('add_group_user_by_name'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_display_name', validate_user_pipe_1.UserDisplayNameToIdPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, chat_dto_1.AddGroupUserByNameDTO]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addGroupUserbyName", null);
__decorate([
    (0, common_1.Post)('ban_group_user'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_id', common_1.ParseIntPipe, validate_user_pipe_1.ValidateUserPipe)),
    __param(3, (0, common_1.Body)('time_minutes')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, Number, chat_dto_1.BanMuteDTO]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "banUser", null);
__decorate([
    (0, common_1.Post)('unban_group_user'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_id', common_1.ParseIntPipe, validate_user_pipe_1.ValidateUserPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, chat_dto_1.RoomAndUserDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "unbanUser", null);
__decorate([
    (0, common_1.Post)('mute_group_user'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_id', common_1.ParseIntPipe, validate_user_pipe_1.ValidateUserPipe)),
    __param(3, (0, common_1.Body)('time_minutes')),
    __param(4, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, Number, chat_dto_1.BanMuteDTO]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "mute", null);
__decorate([
    (0, common_1.Post)('unmute_group_user'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, chat_dto_1.RoomAndUserDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "unmute", null);
__decorate([
    (0, common_1.Post)('promote_group_user'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, chat_dto_1.RoomAndUserDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "promote", null);
__decorate([
    (0, common_1.Post)('demote_group_user'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, chat_dto_1.RoomAndUserDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "demote", null);
__decorate([
    (0, common_1.Post)('set_password'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    (0, swagger_1.ApiOperation)({ summary: 'set password to null or undefined to remove it' }),
    openapi.ApiResponse({ status: 201, type: String }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.RoomAndPasswordDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "set_pswd", null);
__decorate([
    (0, common_1.Post)('set_private'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.SetPrivateDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "set_private", null);
__decorate([
    (0, common_1.Post)('set_owner'),
    (0, swagger_1.ApiTags)('chat - group admin'),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidGroupRoomPipe)),
    __param(2, (0, common_1.Body)('user_id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, Number, chat_dto_1.RoomAndUserDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "set_owner", null);
__decorate([
    (0, common_1.Get)('room_info/:room_id'),
    (0, swagger_1.ApiTags)('chat - general(DM + groups)'),
    openapi.ApiResponse({ status: 200, type: require("./DTO/chat.dto").RoomInfo }),
    __param(0, (0, common_1.Param)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidateRoomPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "groupInfo", null);
__decorate([
    (0, common_1.Get)('conversations'),
    (0, swagger_1.ApiTags)('chat - general(DM + groups)'),
    (0, swagger_1.ApiOperation)({ summary: ' DMs + groups' }),
    openapi.ApiResponse({ status: 200, type: [require("./DTO/chat.dto").RoomInfoShort] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConvs", null);
__decorate([
    (0, common_1.Post)('message_to_room'),
    (0, swagger_1.ApiTags)('chat - compatibility'),
    (0, swagger_1.ApiOperation)({ summary: `Route for compability with previous versions.
		Prefer POST /dm or /group message` }),
    openapi.ApiResponse({ status: 201, type: require("./DTO/chat.dto").MessageDTO }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidateRoomPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number, chat_dto_1.Message2RoomDTO]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "postMsgToRoom", null);
__decorate([
    (0, common_1.Get)('room_messages/:room_id'),
    (0, swagger_1.ApiTags)('chat - compatibility'),
    (0, swagger_1.ApiOperation)({ summary: `Route for compability with previous versions.
		Prefer GET /dm or /group messages` }),
    openapi.ApiResponse({ status: 200, type: [require("./DTO/chat.dto").MessageDTO] }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Param)('room_id', common_1.ParseIntPipe, validate_room_pipe_1.ValidateRoomPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessagesByRoomId", null);
ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        ws_service_1.WsService])
], ChatController);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map