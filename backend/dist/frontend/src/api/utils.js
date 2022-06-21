"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routes = exports.urls = void 0;
exports.urls = {
    frontendUrl: "http://localhost:8000",
    backendUrl: "http://localhost:3000",
    wsUrl: "ws://localhost:3000",
};
exports.routes = {
    createGroup: `${exports.urls.backendUrl}/chat/create_group`,
    getRooms: `${exports.urls.backendUrl}/chat/rooms`,
    addUserToRoom: `${exports.urls.backendUrl}/chat/add_group_user`,
    roomMessages: `${exports.urls.backendUrl}/chat/room_messages`,
    sendDm: `${exports.urls.backendUrl}/chat/message_to_room`,
    users: `${exports.urls.backendUrl}/users`,
    activate2fa: `${exports.urls.backendUrl}/settings/activate-2fa`,
    currentUser: `${exports.urls.backendUrl}/users/me`,
    login42: `${exports.urls.backendUrl}/login/42`,
    friends: `${exports.urls.backendUrl}/friends`,
};
//# sourceMappingURL=utils.js.map