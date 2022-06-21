"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usr = void 0;
const common_1 = require("@nestjs/common");
exports.Usr = (0, common_1.createParamDecorator)((data, ctx) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
});
//# sourceMappingURL=user.decorator.js.map