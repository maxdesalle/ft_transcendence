"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const friends_1 = require("../api/friends");
const user_1 = require("../api/user");
const AcceptFriendRequest = ({ id }) => {
    const { data: user } = (0, user_1.useGetUserById)(id);
    const { mutate } = (0, friends_1.useAcceptFriendRequest)();
    const { mutate: rejectMutate } = (0, friends_1.useRejectFriendRequest)();
    const onAccept = () => {
        if (!id)
            return;
        mutate({ user_id: id });
    };
    const onReject = () => {
        if (!id)
            return;
        rejectMutate({ user_id: id });
    };
    return (<material_1.Card sx={{ padding: "5px" }}>
      {user && (<>
          <material_1.Typography sx={{ textAlign: "center", padding: "5px" }}>
            {user.login42}
          </material_1.Typography>
          <material_1.Box sx={{ display: "flex", justifyContent: "space-around" }}>
            <material_1.Button variant="contained" onClick={() => onAccept()}>
              Accept
            </material_1.Button>
            <material_1.Button onClick={() => onReject()} variant="contained" color="secondary">
              reject
            </material_1.Button>
          </material_1.Box>
        </>)}
    </material_1.Card>);
};
exports.default = AcceptFriendRequest;
//# sourceMappingURL=AcceptFriendRequest.js.map