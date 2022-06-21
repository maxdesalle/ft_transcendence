"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePostDm = exports.useGetMessagesByRoomId = exports.useAddUserToRoom = exports.useGetRooms = exports.useCreateRoom = void 0;
const reactQuery_1 = require("../utils/reactQuery");
const utils_1 = require("./utils");
const useCreateRoom = () => {
    return (0, reactQuery_1.usePost)(utils_1.routes.createGroup, { invalidQueries: [utils_1.routes.getRooms] });
};
exports.useCreateRoom = useCreateRoom;
const useGetRooms = () => {
    return (0, reactQuery_1.useFetch)(utils_1.routes.getRooms);
};
exports.useGetRooms = useGetRooms;
const useAddUserToRoom = () => {
    return (0, reactQuery_1.usePost)(utils_1.routes.addUserToRoom, {});
};
exports.useAddUserToRoom = useAddUserToRoom;
const useGetMessagesByRoomId = (id) => {
    const context = (0, reactQuery_1.useFetchById)(`${utils_1.routes.roomMessages}`, id);
    return Object.assign(Object.assign({}, context), { messages: context.data });
};
exports.useGetMessagesByRoomId = useGetMessagesByRoomId;
const usePostDm = () => {
    return (0, reactQuery_1.usePost)(utils_1.routes.sendDm, {});
};
exports.usePostDm = usePostDm;
//# sourceMappingURL=chat.js.map