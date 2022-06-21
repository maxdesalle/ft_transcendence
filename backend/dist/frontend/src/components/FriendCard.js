"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const user_1 = require("../api/user");
const FriendCard = ({ user_id }) => {
    const { data: user } = (0, user_1.useGetUserById)(user_id);
    return (<>
      {user && (<material_1.Card title={user.login42}>
          <material_1.Typography variant="h5" sx={{ padding: "5px" }}>
            {user.login42}
          </material_1.Typography>
        </material_1.Card>)}
    </>);
};
exports.default = FriendCard;
//# sourceMappingURL=FriendCard.js.map