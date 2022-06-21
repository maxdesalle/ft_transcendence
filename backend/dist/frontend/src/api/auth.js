"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMockLogin = exports.useDeactivateTwoFactorAuth = exports.useActivateTwoFactorAuth = exports.useTwoFactorAuth = exports.logout = exports.useGetProfile = void 0;
const reactQuery_1 = require("../utils/reactQuery");
const js_cookie_1 = require("js-cookie");
const utils_1 = require("./utils");
const BASE_URL = "http://localhost:3000";
const useGetProfile = () => {
    const context = (0, reactQuery_1.useFetch)(`${BASE_URL}/users/me`, undefined, {
        retry: false,
    });
    return Object.assign(Object.assign({}, context), { data: context.data });
};
exports.useGetProfile = useGetProfile;
const logout = (queryClient, navigate) => {
    js_cookie_1.default.remove("jwt_token");
    localStorage.removeItem("user");
    localStorage.removeItem("jwt_token");
    queryClient.removeQueries();
    navigate("/login");
};
exports.logout = logout;
const useTwoFactorAuth = () => {
    return (0, reactQuery_1.usePost)(`${BASE_URL}/login/two-factor-authentication/`, {});
};
exports.useTwoFactorAuth = useTwoFactorAuth;
const useActivateTwoFactorAuth = (url) => {
    const context = (0, reactQuery_1.useFetch)(url, undefined, undefined);
    return Object.assign(Object.assign({}, context), { data: context.data });
};
exports.useActivateTwoFactorAuth = useActivateTwoFactorAuth;
const useDeactivateTwoFactorAuth = () => {
    return (0, reactQuery_1.usePost)(`${BASE_URL}/settings/deactivate-2fa`, {
        invalidQueries: [utils_1.routes.currentUser],
    });
};
exports.useDeactivateTwoFactorAuth = useDeactivateTwoFactorAuth;
const useMockLogin = () => {
    return (0, reactQuery_1.usePost)(`${BASE_URL}/mock-auth/login`, {});
};
exports.useMockLogin = useMockLogin;
//# sourceMappingURL=auth.js.map