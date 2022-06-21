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
exports.DatabaseFilesController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const stream_1 = require("stream");
const database_files_service_1 = require("./database-files.service");
let DatabaseFilesController = class DatabaseFilesController {
    constructor(databaseFilesService) {
        this.databaseFilesService = databaseFilesService;
    }
    async getDatabaseFileById(id, response) {
        const file = await this.databaseFilesService.getFileById(id);
        const stream = stream_1.Readable.from(file.data);
        response.set({ 'Content-Type': 'image/png' });
        return new common_1.StreamableFile(stream);
    }
};
__decorate([
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], DatabaseFilesController.prototype, "getDatabaseFileById", null);
DatabaseFilesController = __decorate([
    (0, common_1.Controller)('database-files'),
    (0, swagger_1.ApiTags)('database-files'),
    __metadata("design:paramtypes", [database_files_service_1.DatabaseFilesService])
], DatabaseFilesController);
exports.DatabaseFilesController = DatabaseFilesController;
//# sourceMappingURL=database-files.controller.js.map