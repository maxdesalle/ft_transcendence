"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../api/auth");
function Profile() {
    const { data } = (0, auth_1.useGetProfile)();
    return (<div>{data && `Profile of ${data.username}`}</div>);
}
exports.default = Profile;
//# sourceMappingURL=Profile.js.map