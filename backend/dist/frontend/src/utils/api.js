"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const axios_1 = require("axios");
exports.api = {
    get: (url, params) => axios_1.default.get(url, Object.assign({ withCredentials: true }, params)),
    post: (url, data) => axios_1.default.post(url, data, { withCredentials: true }),
    delete: (url) => axios_1.default.delete(url, { withCredentials: true }),
    patch: (url, data) => axios_1.default.patch(url, data, { withCredentials: true }),
};
//# sourceMappingURL=api.js.map