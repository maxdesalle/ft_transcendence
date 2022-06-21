"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const config_1 = require("@nestjs/config");
exports.jwtConfig = {
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        return {
            secret: configService.get('JWT_TOKEN_SECRET'),
            signOptions: {
                expiresIn: configService.get('JWT_TOKEN_EXPIRY')
            },
        };
    },
};
//# sourceMappingURL=jwt.config.js.map