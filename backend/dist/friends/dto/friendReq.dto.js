"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendshipRecvUser = exports.FriendshipReqUser = exports.FriendshipRequest = exports.friendReqEventDto = exports.friendRequestDto = void 0;
const openapi = require("@nestjs/swagger");
class friendRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { user_id: { required: true, type: () => Number } };
    }
}
exports.friendRequestDto = friendRequestDto;
class friendReqEventDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { event: { required: true, type: () => String }, friend_request: { required: true, type: () => require("./friendReq.dto").FriendshipRequest } };
    }
}
exports.friendReqEventDto = friendReqEventDto;
class FriendshipRequest {
    static _OPENAPI_METADATA_FACTORY() {
        return { requesting_user: { required: true, type: () => ({ id: { required: true, type: () => Number }, display_name: { required: true, type: () => String } }) }, receiving_user: { required: true, type: () => ({ id: { required: true, type: () => Number }, display_name: { required: true, type: () => String } }) }, status: { required: true, enum: require("../entities/friendship.entity").FrienshipStatus } };
    }
}
exports.FriendshipRequest = FriendshipRequest;
class FriendshipReqUser {
    static _OPENAPI_METADATA_FACTORY() {
        return { req_user_id: { required: true, type: () => Number }, status: { required: true, type: () => Number } };
    }
}
exports.FriendshipReqUser = FriendshipReqUser;
class FriendshipRecvUser {
    static _OPENAPI_METADATA_FACTORY() {
        return { recv_user_id: { required: true, type: () => Number }, status: { required: true, type: () => Number } };
    }
}
exports.FriendshipRecvUser = FriendshipRecvUser;
//# sourceMappingURL=friendReq.dto.js.map