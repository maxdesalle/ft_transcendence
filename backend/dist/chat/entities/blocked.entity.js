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
exports.Blocked = void 0;
const openapi = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
let Blocked = class Blocked {
    static _OPENAPI_METADATA_FACTORY() {
        return { user_id: { required: true, type: () => Number }, blocked_id: { required: true, type: () => Number } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Number)
], Blocked.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'blocked_id' }),
    __metadata("design:type", Number)
], Blocked.prototype, "blocked_id", void 0);
Blocked = __decorate([
    (0, typeorm_1.Entity)()
], Blocked);
exports.Blocked = Blocked;
//# sourceMappingURL=blocked.entity.js.map