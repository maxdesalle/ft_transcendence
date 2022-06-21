"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WsModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_config_1 = require("../config/jwt.config");
const friends_module_1 = require("../friends/friends.module");
const ws_gateway_1 = require("./ws.gateway");
const ws_service_1 = require("./ws.service");
let WsModule = class WsModule {
};
WsModule = __decorate([
    (0, common_1.Module)({
        providers: [ws_service_1.WsService, ws_gateway_1.WsGateway],
        exports: [ws_service_1.WsService],
        imports: [
            jwt_1.JwtModule.registerAsync(jwt_config_1.jwtConfig),
            (0, common_1.forwardRef)(() => friends_module_1.FriendsModule)
        ],
    })
], WsModule);
exports.WsModule = WsModule;
//# sourceMappingURL=ws.module.js.map