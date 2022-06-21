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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntraStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const passport_42_1 = require("passport-42");
const users_service_1 = require("../../users/users.service");
const config_1 = require("@nestjs/config");
let IntraStrategy = class IntraStrategy extends (0, passport_1.PassportStrategy)(passport_42_1.Strategy, '42') {
    constructor(usersService, configService) {
        super({
            clientID: configService.get('FORTYTWO_CLIENT_ID'),
            clientSecret: configService.get('FORTYTWO_CLIENT_SECRET'),
            callbackURL: configService.get('FORTYTWO_CALLBACK_URL'),
            scope: ['public'],
        });
        this.usersService = usersService;
        this.configService = configService;
    }
    async validate(accessToken, refreshToken, user) {
        const new_user = this.usersService.createNewUser(user.username);
        return new_user;
    }
};
IntraStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService])
], IntraStrategy);
exports.IntraStrategy = IntraStrategy;
//# sourceMappingURL=intra.strategy.js.map