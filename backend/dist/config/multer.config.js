"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerConfig = void 0;
const config_1 = require("@nestjs/config");
const file_upload_utils_1 = require("../users/utils/file-upload.utils");
exports.multerConfig = {
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        return {
            limits: {
                fileSize: +configService.get('AVATAR_MAX_SIZE'),
            },
            fileFilter: file_upload_utils_1.imageFileFilter,
        };
    },
};
//# sourceMappingURL=multer.config.js.map