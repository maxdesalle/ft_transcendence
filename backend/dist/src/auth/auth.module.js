"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const users_module_1 = require("../users/users.module");
const jwt_1 = require("@nestjs/jwt");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const intra_strategy_1 = require("./strategy/intra.strategy");
const jwt_strategy_1 = require("./strategy/jwt.strategy");
const tfa_strategy_1 = require("./strategy/tfa.strategy");
const html_module_1 = require("../html/html.module");
const jwt_config_1 = require("../config/jwt.config");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            users_module_1.UsersModule,
            html_module_1.HtmlModule,
            jwt_1.JwtModule.registerAsync(jwt_config_1.jwtConfig),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, intra_strategy_1.IntraStrategy, jwt_strategy_1.JwtStrategy, tfa_strategy_1.JwtTwoFactorStrategy]
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map