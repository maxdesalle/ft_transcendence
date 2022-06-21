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
exports.User = void 0;
const openapi = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const databaseFile_entity_1 = require("../../database-files/entities/databaseFile.entity");
const friendship_entity_1 = require("../../friends/entities/friendship.entity");
const typeorm_1 = require("typeorm");
let User = class User {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, login42: { required: true, type: () => String }, display_name: { required: true, type: () => String }, avatar: { required: false, type: () => require("../../database-files/entities/databaseFile.entity").DatabaseFile }, avatarId: { required: false, type: () => Number }, isTwoFactorAuthenticationEnabled: { required: true, type: () => Boolean }, twoFactorAuthenticationSecret: { required: false, type: () => String }, status: { required: true, type: () => Boolean }, statuss: { required: false, type: () => String }, requested_friendships: { required: true, type: () => [require("../../friends/entities/friendship.entity").Friendship] }, received_friendships: { required: true, type: () => [require("../../friends/entities/friendship.entity").Friendship] } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "login42", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "display_name", void 0);
__decorate([
    (0, typeorm_1.JoinColumn)({ name: 'avatarId' }),
    (0, typeorm_1.OneToOne)(() => databaseFile_entity_1.DatabaseFile, { nullable: true }),
    __metadata("design:type", databaseFile_entity_1.DatabaseFile)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "avatarId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isTwoFactorAuthenticationEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, class_transformer_1.Exclude)(),
    __metadata("design:type", String)
], User.prototype, "twoFactorAuthenticationSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Boolean)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, (friendship) => friendship.requesting_user),
    __metadata("design:type", Array)
], User.prototype, "requested_friendships", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendship_entity_1.Friendship, (friendship) => friendship.receiving_user),
    __metadata("design:type", Array)
], User.prototype, "received_friendships", void 0);
User = __decorate([
    (0, typeorm_1.Entity)()
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map