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
exports.UsersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_decorator_1 = require("./decorators/user.decorator");
const users_service_1 = require("./users.service");
const platform_express_1 = require("@nestjs/platform-express");
const stream_1 = require("stream");
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const fileUpload_dto_1 = require("./dto/fileUpload.dto");
const changeName_dto_1 = require("./dto/changeName.dto");
let UsersController = class UsersController {
    constructor(usersService, configService) {
        this.usersService = usersService;
        this.configService = configService;
    }
    async getAllUsers() {
        return await this.usersService.findAll();
    }
    async getProfile(user) {
        return await this.usersService.findById(user.id);
    }
    async getAvatar(user, response) {
        let stream;
        if (!user.avatarId) {
            stream = (0, fs_1.createReadStream)((0, path_1.join)(process.cwd(), this.configService.get('AVATAR_DEFAULT_FILE')));
        }
        else {
            const file = await this.usersService.getAvatar(user.avatarId);
            stream = stream_1.Readable.from(file.data);
        }
        response.set({ 'Content-Type': 'image/png' });
        return new common_1.StreamableFile(stream);
    }
    async getUserById(id) {
        return await this.usersService.findById(id);
    }
    async addAvatar(user, file) {
        if (!file)
            throw new common_1.BadRequestException();
        return this.usersService.changeAvatar(user.id, file.buffer, file.originalname);
    }
    changeName(user, { display_name }) {
        return this.usersService.setDisplayName(user.id, display_name);
    }
};
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200, type: [require("./entities/user.entity").User] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200, type: require("./entities/user.entity").User }),
    __param(0, (0, user_decorator_1.Usr)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)('avatar'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAvatar", null);
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./entities/user.entity").User }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Post)('avatar'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'avatar image file',
        type: fileUpload_dto_1.fileUploadDto
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    openapi.ApiResponse({ status: 201, type: String }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addAvatar", null);
__decorate([
    (0, common_1.Post)('set_display_name'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtGuard),
    openapi.ApiResponse({ status: 201, type: require("./entities/user.entity").User }),
    __param(0, (0, user_decorator_1.Usr)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, changeName_dto_1.changeNameDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changeName", null);
UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map