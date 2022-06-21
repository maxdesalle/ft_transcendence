"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = require("react");
const friends_1 = require("../api/friends");
const AcceptFriendRequest_1 = require("./AcceptFriendRequest");
const AddFriend = () => {
    const { mutate, status } = (0, friends_1.useAddFriendById)();
    const { pendingRequests } = (0, friends_1.useGetPendingFriendRequest)();
    const [userId, setUserId] = (0, react_1.useState)(0);
    const onAddFriend = () => {
        if (!userId)
            return;
        mutate({ user_id: userId });
    };
    return (<material_1.Stack spacing={2}>
      <material_1.TextField type="number" label="user id" onChange={(e) => setUserId(parseInt(e.target.value))}/>
      <material_1.Button variant="contained" onClick={() => onAddFriend()}>
        Add friend
      </material_1.Button>
      <material_1.Stack spacing={2}>
        <material_1.Typography>Pending requests</material_1.Typography>
        {pendingRequests &&
            pendingRequests.map((id) => <AcceptFriendRequest_1.default key={id} id={id}/>)}
      </material_1.Stack>
      {status == "success" ? (<material_1.Typography color="greenyellow">success</material_1.Typography>) : null}
    </material_1.Stack>);
};
exports.default = AddFriend;
//# sourceMappingURL=AddFriend.js.map