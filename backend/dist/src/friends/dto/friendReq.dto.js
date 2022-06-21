"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendReqEventDto = exports.friendRequestDto = void 0;
const openapi = require("@nestjs/swagger");
class friendRequestDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { user_id: { required: true, type: () => Number } };
    }
}
exports.friendRequestDto = friendRequestDto;
class friendReqEventDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { event: { required: true, type: () => String }, friend_request: { required: true, type: () => require("../entities/friendship.entity").Friendship } };
    }
}
exports.friendReqEventDto = friendReqEventDto;
//# sourceMappingURL=friendReq.dto.js.map