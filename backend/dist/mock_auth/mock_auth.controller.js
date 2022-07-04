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
exports.MockAuthController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("../users/users.service");
const login_dto_1 = require("./DTO/login.dto");
let MockAuthController = class MockAuthController {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async getUserLoggedIn(res, login42, _body) {
        const user = await this.usersService.createNewUser(login42);
        const jwtToken = this.jwtService.sign({
            id: user.id,
            login42: user.login42,
        });
        res.cookie('jwt_token', jwtToken);
        return `Logged in as ${user.login42} (user_id ${user.id})`;
    }
    logout(res) {
        res.clearCookie('jwt_token');
        return `Logged out`;
    }
};
__decorate([
    (0, common_1.Post)('login'),
    openapi.ApiResponse({ status: 201, type: String }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __param(1, (0, common_1.Body)('login42')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, login_dto_1.LoginDTO]),
    __metadata("design:returntype", Promise)
], MockAuthController.prototype, "getUserLoggedIn", null);
__decorate([
    (0, common_1.Get)('logout'),
    openapi.ApiResponse({ status: 200, type: String }),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], MockAuthController.prototype, "logout", null);
MockAuthController = __decorate([
    (0, common_1.Controller)('mock-auth'),
    (0, swagger_1.ApiTags)('mock-auth'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], MockAuthController);
exports.MockAuthController = MockAuthController;
//# sourceMappingURL=mock_auth.controller.js.map