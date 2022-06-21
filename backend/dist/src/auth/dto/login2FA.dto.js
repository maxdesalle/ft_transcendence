"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login2faDTO = void 0;
const openapi = require("@nestjs/swagger");
class Login2faDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { twoFactorAuthenticationCode: { required: true, type: () => String } };
    }
}
exports.Login2faDTO = Login2faDTO;
//# sourceMappingURL=login2FA.dto.js.map