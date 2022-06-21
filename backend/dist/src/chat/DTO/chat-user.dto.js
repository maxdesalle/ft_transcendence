"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = exports.Conversation = void 0;
const openapi = require("@nestjs/swagger");
class Conversation {
    constructor(room_id, room_name, type) {
        this.room_id = room_id;
        this.room_name = room_name;
        this.type = type;
        this.participants = [];
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { participants: { required: true, type: () => [Number] } };
    }
}
exports.Conversation = Conversation;
class Session {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, login42: { required: true, type: () => String }, selected_room: { required: false, type: () => Number }, blocked: { required: false, type: () => [Number] }, messages: { required: false, type: () => [Object] }, conversations: { required: false, type: () => [require("./chat-user.dto").Conversation] } };
    }
}
exports.Session = Session;
//# sourceMappingURL=chat-user.dto.js.map