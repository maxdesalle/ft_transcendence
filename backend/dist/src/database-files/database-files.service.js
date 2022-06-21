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
exports.DatabaseFilesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const databaseFile_entity_1 = require("./entities/databaseFile.entity");
let DatabaseFilesService = class DatabaseFilesService {
    constructor(databaseFilesRespository) {
        this.databaseFilesRespository = databaseFilesRespository;
    }
    async uploadDatabaseFile(dataBuffer, filename) {
        const newFile = this.databaseFilesRespository.create({
            filename,
            data: dataBuffer
        });
        await this.databaseFilesRespository.save(newFile);
        return newFile;
    }
    async getFileById(fileId) {
        const file = await this.databaseFilesRespository.findOne(fileId);
        if (!file) {
            throw new common_1.NotFoundException();
        }
        return file;
    }
    async uploadDBFileWithQueryRunner(dataBuffer, filename, queryRunner) {
        const newFile = await queryRunner.manager.create(databaseFile_entity_1.DatabaseFile, {
            filename,
            data: dataBuffer
        });
        await queryRunner.manager.save(databaseFile_entity_1.DatabaseFile, newFile);
        return newFile;
    }
    async deleteFileWithQueryRunner(fileId, queryRunner) {
        const deleteResponse = await queryRunner.manager.delete(databaseFile_entity_1.DatabaseFile, fileId);
        if (!deleteResponse.affected) {
            throw new common_1.NotFoundException();
        }
    }
};
DatabaseFilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(databaseFile_entity_1.DatabaseFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DatabaseFilesService);
exports.DatabaseFilesService = DatabaseFilesService;
//# sourceMappingURL=database-files.service.js.map