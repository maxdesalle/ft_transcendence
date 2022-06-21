"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const AddFriend_1 = require("../components/AddFriend");
const AddUserToRoom_1 = require("../components/AddUserToRoom");
const CreateRoom_1 = require("../components/CreateRoom");
const FriendList_1 = require("../components/FriendList");
const Admin = () => {
    return (<material_1.Box sx={{
            display: "flex",
            paddingTop: 5,
            height: "100%",
        }}>
      <material_1.Box sx={{ minWidth: 250, padding: 2 }}>
        <CreateRoom_1.default />
      </material_1.Box>
      <material_1.Box sx={{ minWidth: 250, padding: 2 }}>
        <AddUserToRoom_1.default />
      </material_1.Box>
      <material_1.Box sx={{ minWidth: 250, padding: 2 }}>
        <AddFriend_1.default />
      </material_1.Box>
      <material_1.Box sx={{ minWidth: 250, padding: 2 }}>
        <FriendList_1.default />
      </material_1.Box>
    </material_1.Box>);
};
exports.default = Admin;
//# sourceMappingURL=Admin.js.map