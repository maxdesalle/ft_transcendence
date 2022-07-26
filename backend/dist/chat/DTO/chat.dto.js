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
exports.SetPrivateDto = exports.RoomAndPasswordDto = exports.BanMuteDTO = exports.AddGroupUserByNameDTO = exports.RoomAndUserDto = exports.GroupConfigDto = exports.RoomInfo = exports.RoomIdDto = exports.UserIdDto = exports.MessageDTO = exports.Message2RoomDTO = exports.PostDmDto = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class PostDmDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { user_id: { required: true, type: () => Number }, message: { required: true, type: () => String } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PostDmDto.prototype, "message", void 0);
exports.PostDmDto = PostDmDto;
class Message2RoomDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, message: { required: true, type: () => String } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], Message2RoomDTO.prototype, "message", void 0);
exports.Message2RoomDTO = Message2RoomDTO;
class MessageDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => Number }, user_id: { required: true, type: () => Number }, login42: { required: true, type: () => String }, display_name: { required: true, type: () => String }, message: { required: true, type: () => String }, timestamp: { required: true, type: () => Date } };
    }
}
exports.MessageDTO = MessageDTO;
class UserIdDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { user_id: { required: true, type: () => Number } };
    }
}
exports.UserIdDto = UserIdDto;
class RoomIdDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number } };
    }
}
exports.RoomIdDto = RoomIdDto;
class RoomInfo {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, room_name: { required: true, type: () => String }, type: { required: true, type: () => String }, blocked: { required: false, type: () => Boolean }, private: { required: true, type: () => Boolean }, password_protected: { required: true, type: () => Boolean }, users: { required: true, type: () => ({ id: { required: true, type: () => Number }, login42: { required: true, type: () => String }, display_name: { required: true, type: () => String }, avatarId: { required: true, type: () => Number }, role: { required: false, type: () => String }, muted: { required: false, type: () => Boolean } }) }, last_msg: { required: true, type: () => require("./chat.dto").MessageDTO } };
    }
}
exports.RoomInfo = RoomInfo;
class GroupConfigDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, private: { required: false, type: () => Boolean }, password: { required: false, type: () => String } };
    }
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.NotContains)("'"),
    __metadata("design:type", String)
], GroupConfigDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], GroupConfigDto.prototype, "private", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.NotContains)("'"),
    __metadata("design:type", String)
], GroupConfigDto.prototype, "password", void 0);
exports.GroupConfigDto = GroupConfigDto;
class RoomAndUserDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, user_id: { required: true, type: () => Number } };
    }
}
exports.RoomAndUserDto = RoomAndUserDto;
class AddGroupUserByNameDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, user_display_name: { required: true, type: () => String } };
    }
}
exports.AddGroupUserByNameDTO = AddGroupUserByNameDTO;
class BanMuteDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, user_id: { required: true, type: () => Number }, time_minutes: { required: true, type: () => Number, minimum: 1 } };
    }
}
__decorate([
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], BanMuteDTO.prototype, "time_minutes", void 0);
exports.BanMuteDTO = BanMuteDTO;
class RoomAndPasswordDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, password: { required: true, type: () => String } };
    }
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.NotContains)("'"),
    __metadata("design:type", String)
], RoomAndPasswordDto.prototype, "password", void 0);
exports.RoomAndPasswordDto = RoomAndPasswordDto;
class SetPrivateDto {
    static _OPENAPI_METADATA_FACTORY() {
        return { room_id: { required: true, type: () => Number }, private: { required: true, type: () => Boolean } };
    }
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SetPrivateDto.prototype, "private", void 0);
exports.SetPrivateDto = SetPrivateDto;
//# sourceMappingURL=chat.dto.js.map