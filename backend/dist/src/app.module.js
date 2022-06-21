"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const database_files_module_1 = require("./database-files/database-files.module");
const html_module_1 = require("./html/html.module");
const config_1 = require("@nestjs/config");
const typeorm_config_1 = require("./config/typeorm.config");
const chat_module_1 = require("./chat/chat.module");
const mock_auth_module_1 = require("./mock_auth/mock_auth.module");
const friends_module_1 = require("./friends/friends.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const ws_module_1 = require("./ws/ws.module");
const pong_module_1 = require("./pong/pong.module");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            database_files_module_1.DatabaseFilesModule,
            html_module_1.HtmlModule,
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync(typeorm_config_1.typeormConfig),
            chat_module_1.ChatModule,
            mock_auth_module_1.MockAuthModule,
            friends_module_1.FriendsModule,
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'client'),
            }),
            ws_module_1.WsModule,
            pong_module_1.PongModule
        ],
        controllers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map