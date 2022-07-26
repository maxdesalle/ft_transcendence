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
exports.Banned = void 0;
const openapi = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const room_entity_1 = require("./room.entity");
let Banned = class Banned {
    static _OPENAPI_METADATA_FACTORY() {
        return { pk: { required: true, type: () => Number }, room_id: { required: true, type: () => Number }, user_id: { required: true, type: () => Number }, banned_id: { required: true, type: () => Number }, unban: { required: true, type: () => Date }, mute: { required: true, type: () => Boolean }, role: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Banned.prototype, "pk", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => room_entity_1.Room),
    (0, typeorm_1.JoinColumn)({ name: 'room_id' }),
    __metadata("design:type", Number)
], Banned.prototype, "room_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Banned.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'banned_id' }),
    __metadata("design:type", Number)
], Banned.prototype, "banned_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "timestamptz",
        precision: 3,
        nullable: true
    }),
    __metadata("design:type", Date)
], Banned.prototype, "unban", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Boolean)
], Banned.prototype, "mute", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: true
    }),
    __metadata("design:type", Number)
], Banned.prototype, "role", void 0);
Banned = __decorate([
    (0, typeorm_1.Entity)()
], Banned);
exports.Banned = Banned;
//# sourceMappingURL=banned.entity.js.map