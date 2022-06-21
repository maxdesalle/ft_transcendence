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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const intra_guard_1 = require("./guards/intra.guard");
const jwt_guard_1 = require("./guards/jwt.guard");
const tfa_guard_1 = require("./guards/tfa.guard");
const jwt_1 = require("@nestjs/jwt");
const auth_service_1 = require("./auth.service");
const qrcode_1 = require("qrcode");
const users_service_1 = require("../users/users.service");
const user_decorator_1 = require("../users/decorators/user.decorator");
const swagger_1 = require("@nestjs/swagger");
const login2FA_dto_1 = require("./dto/login2FA.dto");
async function pipeQrCodeStream(stream, otpauthUrl) {
    return (0, qrcode_1.toFileStream)(stream, otpauthUrl);
}
let AuthController = class AuthController {
    constructor(authService, jwtService, usersService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.usersService = usersService;
    }
    getUserLogin() { }
    getUserLoggedIn(user, res) {
        const jwtToken = this.jwtService.sign({
            id: user.id,
            login42: user.login42,
        });
        res.cookie('jwt_token', jwtToken);
        return res.redirect('http://localhost:8000');
    }
    async activateTwoFactorAuthentication(user, res) {
        const { otpauthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(user);
        return pipeQrCodeStream(res, otpauthUrl);
    }
    async deactivateTwoFactorAuthentication(user, res) {
        await this.usersService.turnOffTwoFactorAuthentication(user.id);
        return res.redirect('/login/');
    }
    twoFactorAuthentication(user, { twoFactorAuthenticationCode }, res) {
        const isTwoFactorAuthenticationCodeValid = this.authService.check2FACodeValidity(twoFactorAuthenticationCode, user);
        if (!isTwoFactorAuthenticationCodeValid) {
            throw new common_1.UnauthorizedException('Invalid 2FA code');
        }
        const jwtToken = this.jwtService.sign({
            id: user.id,
            login42: user.login42,
            validTwoFactorAuthentication: true,
        });
        res.clearCookie('jwt_token');
        res.cookie('jwt_token', jwtToken);
        return res.redirect('/');
    }
    getLogoutPage(res) {
        res.clearCookie('jwt_token');
        return res.redirect('/login/');
    }
};
__decorate([
    (0, common_1.Get)('login/42'),
    (0, common_1.UseGuards)(intra_guard_1.IntraGuard),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getUserLogin", null);
__decorate([
    (0, common_1.Get)('login/42/return'),
    (0, common_1.UseGuards)(intra_guard_1.IntraGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getUserLoggedIn", null);
__decorate([
    (0, common_1.Get)('/settings/activate-2fa'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: Object }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "activateTwoFactorAuthentication", null);
__decorate([
    (0, common_1.Get)('/settings/deactivate-2fa'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "deactivateTwoFactorAuthentication", null);
__decorate([
    (0, common_1.Post)('/login/two-factor-authentication/'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(tfa_guard_1.JwtTwoFactorAuthenticationGuard),
    (0, swagger_1.ApiHeader)({
        name: 'Cookie',
        description: 'a cookie with a valid jwt-token must be included',
    }),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, login2FA_dto_1.Login2faDTO, Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "twoFactorAuthentication", null);
__decorate([
    (0, common_1.Get)('logout'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getLogoutPage", null);
AuthController = __decorate([
    (0, common_1.Controller)(),
    (0, swagger_1.ApiTags)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        users_service_1.UsersService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map