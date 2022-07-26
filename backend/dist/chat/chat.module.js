"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_config_1 = require("../config/jwt.config");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const users_module_1 = require("../users/users.module");
const ws_module_1 = require("../ws/ws.module");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    (0, common_1.Module)({
        controllers: [chat_controller_1.ChatController],
        providers: [chat_service_1.ChatService],
        imports: [jwt_1.JwtModule.registerAsync(jwt_config_1.jwtConfig), users_module_1.UsersModule, ws_module_1.WsModule],
        exports: [chat_service_1.ChatService]
    })
], ChatModule);
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map