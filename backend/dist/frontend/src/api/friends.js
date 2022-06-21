"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRejectFriendRequest = exports.useGetAllFriends = exports.useAcceptFriendRequest = exports.useGetPendingFriendRequest = exports.useAddFriendById = void 0;
const reactQuery_1 = require("../utils/reactQuery");
const utils_1 = require("./utils");
const useAddFriendById = () => {
    return (0, reactQuery_1.usePost)(`${utils_1.routes.friends}/send_friend_request`, {
        invalidQueries: [`${utils_1.routes.friends}/pending_received`],
    });
};
exports.useAddFriendById = useAddFriendById;
const useGetPendingFriendRequest = () => {
    const context = (0, reactQuery_1.useFetch)(`${utils_1.routes.friends}/pending_received`);
    return Object.assign(Object.assign({}, context), { pendingRequests: context.data });
};
exports.useGetPendingFriendRequest = useGetPendingFriendRequest;
const useAcceptFriendRequest = () => {
    return (0, reactQuery_1.usePost)(`${utils_1.routes.friends}/accept_friend_request`, {
        invalidQueries: [
            `${utils_1.routes.friends}/pending_received`,
            `${utils_1.routes.friends}/id`,
        ],
    });
};
exports.useAcceptFriendRequest = useAcceptFriendRequest;
const useGetAllFriends = () => {
    const context = (0, reactQuery_1.useFetch)(`${utils_1.routes.friends}/id`);
    return Object.assign(Object.assign({}, context), { friendsIds: context.data });
};
exports.useGetAllFriends = useGetAllFriends;
const useRejectFriendRequest = () => {
    return (0, reactQuery_1.usePost)(`${utils_1.routes.friends}/reject_friend_request`, {
        invalidQueries: [`${utils_1.routes.friends}/pending_received`],
    });
};
exports.useRejectFriendRequest = useRejectFriendRequest;
//# sourceMappingURL=friends.js.map