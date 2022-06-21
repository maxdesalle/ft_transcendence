"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginDTO = void 0;
const openapi = require("@nestjs/swagger");
class LoginDTO {
    static _OPENAPI_METADATA_FACTORY() {
        return { login42: { required: true, type: () => String } };
    }
}
exports.LoginDTO = LoginDTO;
//# sourceMappingURL=login.dto.js.map