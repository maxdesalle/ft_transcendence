"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const friends_1 = require("../api/friends");
const FriendCard_1 = require("./FriendCard");
const FriendList = () => {
    const { friendsIds } = (0, friends_1.useGetAllFriends)();
    return (<material_1.Stack spacing={2}>
      <material_1.Typography variant="h4">Friend List</material_1.Typography>
      {friendsIds &&
            friendsIds.map((id) => <FriendCard_1.default key={id} user_id={id}/>)}
    </material_1.Stack>);
};
exports.default = FriendList;
//# sourceMappingURL=FriendList.js.map