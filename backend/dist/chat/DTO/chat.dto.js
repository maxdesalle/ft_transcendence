"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addGroupUserByNameDTO = exports.addGroupUserDTO = exports.GroupConfig = exports.RoomInfoShort = exports.RoomInfo = exports.Message2Room = exports.Message = exports.PostDM = void 0;
const openapi = require("@nestjs/swagger");
class PostDM {
    static _OPENAPI_METADATA_FACTORY() {
        return { user_id: { required: true, type: () => Number }, message: { required: true, type: () => String } };
    }
}
exports.PostDM = PostDM;
class Message {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, user_id: { required: true, type: () => Number }, login42: { required: true, type: () => String }, display_name: { required: true, type: () => String }, message: { required: true, type: () => String }, timestamp: { required: true, type: () => Date } };
    }
}
exports.Message = Message;
class Message2Room {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, message: { required: true, type: () => String } };
    }
}
exports.Message2Room = Message2Room;
class UserRole {
    static _OPENAPI_METADATA_FACTORY() {
        return { user_id: { required: true, type: () => Number }, role: { required: true, type: () => String } };
    }
}
class RoomInfo {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, room_name: { required: true, type: () => String }, type: { required: true, type: () => String }, private: { required: true, type: () => Boolean }, password_protected: { required: true, type: () => Boolean }, users: { required: true, type: () => [UserRole] } };
    }
}
exports.RoomInfo = RoomInfo;
class RoomInfoShort {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, room_name: { required: true, type: () => String }, type: { required: true, type: () => String }, participants: { required: true, type: () => [Number] } };
    }
}
exports.RoomInfoShort = RoomInfoShort;
class GroupConfig {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, private: { required: false, type: () => Boolean }, password: { required: false, type: () => String } };
    }
}
exports.GroupConfig = GroupConfig;
class addGroupUserDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, user_id: { required: true, type: () => Number } };
    }
}
exports.addGroupUserDTO = addGroupUserDTO;
class addGroupUserByNameDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, user_display_name: { required: true, type: () => String } };
    }
}
exports.addGroupUserByNameDTO = addGroupUserByNameDTO;
//# sourceMappingURL=chat.dto.js.map