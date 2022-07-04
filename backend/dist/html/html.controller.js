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
exports.HtmlController = exports.ViewAuthFilter = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_decorator_1 = require("../users/decorators/user.decorator");
const users_service_1 = require("../users/users.service");
const html_service_1 = require("./html.service");
const swagger_1 = require("@nestjs/swagger");
let ViewAuthFilter = class ViewAuthFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception.getStatus();
        response.status(status).redirect('/login');
    }
};
ViewAuthFilter = __decorate([
    (0, common_1.Catch)(common_1.UnauthorizedException)
], ViewAuthFilter);
exports.ViewAuthFilter = ViewAuthFilter;
let HtmlController = class HtmlController {
    constructor(usersService, htmlService) {
        this.usersService = usersService;
        this.htmlService = htmlService;
    }
    async getHomePage(user) {
        const user_object = await this.usersService.findById(user.id);
        return this.htmlService.getHomePage(user_object.login42);
    }
    getLoginPage() {
        return this.htmlService.getLoginPage();
    }
    getSettingsPage() {
        return this.htmlService.getSettingsPage();
    }
    uploadAvatar() {
        return this.htmlService.getAvatarUploadForm();
    }
    pongPlayer() { }
};
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseFilters)(ViewAuthFilter),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: String }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HtmlController.prototype, "getHomePage", null);
__decorate([
    (0, common_1.Get)('login'),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], HtmlController.prototype, "getLoginPage", null);
__decorate([
    (0, common_1.Get)('settings'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], HtmlController.prototype, "getSettingsPage", null);
__decorate([
    (0, common_1.Get)('upload_avatar'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: String }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HtmlController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)('player'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, common_1.UseFilters)(ViewAuthFilter),
    (0, common_1.Redirect)('player.html'),
    openapi.ApiResponse({ status: 200 }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HtmlController.prototype, "pongPlayer", null);
HtmlController = __decorate([
    (0, common_1.Controller)(),
    (0, swagger_1.ApiTags)('HTML pages (for testing)'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        html_service_1.HtmlService])
], HtmlController);
exports.HtmlController = HtmlController;
//# sourceMappingURL=html.controller.js.map