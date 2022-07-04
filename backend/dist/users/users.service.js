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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const database_files_service_1 = require("../database-files/database-files.service");
const stats_service_1 = require("../stats/stats.service");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
let UsersService = class UsersService {
    constructor(usersRepository, databaseFilesService, connection, statsService) {
        this.usersRepository = usersRepository;
        this.databaseFilesService = databaseFilesService;
        this.connection = connection;
        this.statsService = statsService;
    }
    async createNewUser(login42) {
        let user = await this.findByLogin42(login42);
        if (user == undefined) {
            user = new user_entity_1.User();
            user.login42 = login42;
            user.display_name = login42;
            const new_user = await this.usersRepository.save(user);
            await this.statsService.newPlayer(new_user.id);
        }
        return user;
    }
    async turnOnTwoFactorAuthentication(userId) {
        return this.usersRepository.update(userId, {
            isTwoFactorAuthenticationEnabled: true,
        });
    }
    async turnOffTwoFactorAuthentication(userId) {
        return this.usersRepository.update(userId, {
            isTwoFactorAuthenticationEnabled: false,
        });
    }
    async setTwoFactorAuthenticationSecret(secret, userId) {
        return this.usersRepository.update(userId, {
            twoFactorAuthenticationSecret: secret,
        });
    }
    findById(id) {
        return this.usersRepository.findOne(id);
    }
    findByLogin42(login42) {
        return this.usersRepository.findOne({ login42 });
    }
    findByDisplayName(display_name) {
        return this.usersRepository.findOne({ display_name });
    }
    findAll() {
        return this.usersRepository.find();
    }
    async setDisplayName(user_id, new_name) {
        const user_exists = await this.usersRepository.findOne({ display_name: new_name });
        if (user_exists)
            throw new common_1.ConflictException("name already taken");
        const user = await this.usersRepository.findOne(user_id);
        user.display_name = new_name;
        this.usersRepository.save(user);
        return user;
    }
    async changeAvatar(userId, imageBuffer, filename) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const user = await queryRunner.manager.findOne(user_entity_1.User, userId);
            const currentAvatarId = user.avatarId;
            const avatar = await this.databaseFilesService.uploadDBFileWithQueryRunner(imageBuffer, filename, queryRunner);
            await queryRunner.manager.update(user_entity_1.User, userId, {
                avatarId: avatar.id
            });
            if (currentAvatarId) {
                await this.databaseFilesService.deleteFileWithQueryRunner(currentAvatarId, queryRunner);
            }
            await queryRunner.commitTransaction();
            return `/database-files/${avatar.id}`;
        }
        catch (_a) {
            await queryRunner.rollbackTransaction();
            throw new common_1.InternalServerErrorException();
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAvatar(avatarId) {
        return this.databaseFilesService.getFileById(avatarId);
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        database_files_service_1.DatabaseFilesService,
        typeorm_2.Connection,
        stats_service_1.StatsService])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map