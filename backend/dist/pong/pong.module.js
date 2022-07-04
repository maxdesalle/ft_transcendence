"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PongModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const jwt_config_1 = require("../config/jwt.config");
const stats_module_1 = require("../stats/stats.module");
const users_module_1 = require("../users/users.module");
const ws_module_1 = require("../ws/ws.module");
const pong_gateway_1 = require("./pong.gateway");
let PongModule = class PongModule {
};
PongModule = __decorate([
    (0, common_1.Module)({
        providers: [pong_gateway_1.PongGateway, pong_gateway_1.PongViewerGateway],
        imports: [
            jwt_1.JwtModule.registerAsync(jwt_config_1.jwtConfig),
            users_module_1.UsersModule,
            (0, common_1.forwardRef)(() => ws_module_1.WsModule),
            stats_module_1.StatsModule
        ]
    })
], PongModule);
exports.PongModule = PongModule;
//# sourceMappingURL=pong.module.js.map