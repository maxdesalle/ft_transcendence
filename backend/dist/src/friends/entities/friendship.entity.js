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
exports.Friendship = exports.FrienshipStatus = void 0;
const openapi = require("@nestjs/swagger");
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
var FrienshipStatus;
(function (FrienshipStatus) {
    FrienshipStatus[FrienshipStatus["pending"] = 0] = "pending";
    FrienshipStatus[FrienshipStatus["accepted"] = 1] = "accepted";
    FrienshipStatus[FrienshipStatus["rejected"] = 2] = "rejected";
})(FrienshipStatus = exports.FrienshipStatus || (exports.FrienshipStatus = {}));
let Friendship = class Friendship {
    static _OPENAPI_METADATA_FACTORY() {
        return { req_user_id: { required: true, type: () => Number }, recv_user_id: { required: true, type: () => Number }, requesting_user: { required: true, type: () => require("../../users/entities/user.entity").User }, receiving_user: { required: true, type: () => require("../../users/entities/user.entity").User }, status: { required: true, enum: require("./friendship.entity").FrienshipStatus } };
    }
};
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Friendship.prototype, "req_user_id", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Friendship.prototype, "recv_user_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.requested_friendships),
    __metadata("design:type", user_entity_1.User)
], Friendship.prototype, "requesting_user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.received_friendships),
    __metadata("design:type", user_entity_1.User)
], Friendship.prototype, "receiving_user", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: FrienshipStatus.pending }),
    __metadata("design:type", Number)
], Friendship.prototype, "status", void 0);
Friendship = __decorate([
    (0, typeorm_1.Entity)()
], Friendship);
exports.Friendship = Friendship;
//# sourceMappingURL=friendship.entity.js.map