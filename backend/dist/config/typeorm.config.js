"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeormConfig = void 0;
const config_1 = require("@nestjs/config");
exports.typeormConfig = {
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        return {
            type: "postgres",
            host: "127.0.0.1",
            port: 5432,
            username: "postgres",
            password: configService.get('DB_PASSWORD'),
            database: "postgres",
            entities: ["dist/**/*.entity{.ts,.js}"],
            synchronize: true
        };
    },
};
//# sourceMappingURL=typeorm.config.js.map