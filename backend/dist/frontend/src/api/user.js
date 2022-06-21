"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGetAllUsers = exports.usePostAvatar = exports.useGetUserById = exports.useGetAvatar = void 0;
const reactQuery_1 = require("../utils/reactQuery");
const utils_1 = require("./utils");
const useGetAvatar = () => {
    const context = (0, reactQuery_1.useFetch)(`${utils_1.routes.users}/user/avatar`, undefined, {
        retry: false,
    });
    return Object.assign(Object.assign({}, context), { imageUrl: "http://localhost:3000/users/avatar" });
};
exports.useGetAvatar = useGetAvatar;
const useGetUserById = (id) => {
    const context = (0, reactQuery_1.useFetch)(`${utils_1.routes.users}`, id.toString());
    return Object.assign(Object.assign({}, context), { user: context.data });
};
exports.useGetUserById = useGetUserById;
const usePostAvatar = () => {
    return (0, reactQuery_1.usePost)(`${utils_1.routes.users}/avatar`, {});
};
exports.usePostAvatar = usePostAvatar;
const useGetAllUsers = () => {
    const context = (0, reactQuery_1.useFetch)(`${utils_1.routes.users}`);
    return Object.assign(Object.assign({}, context), { users: context.data });
};
exports.useGetAllUsers = useGetAllUsers;
//# sourceMappingURL=user.js.map