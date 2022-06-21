"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlModule = void 0;
const common_1 = require("@nestjs/common");
const users_module_1 = require("../users/users.module");
const html_controller_1 = require("./html.controller");
const html_service_1 = require("./html.service");
let HtmlModule = class HtmlModule {
};
HtmlModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [html_controller_1.HtmlController],
        providers: [html_service_1.HtmlService],
        exports: [html_service_1.HtmlService]
    })
], HtmlModule);
exports.HtmlModule = HtmlModule;
//# sourceMappingURL=html.module.js.map