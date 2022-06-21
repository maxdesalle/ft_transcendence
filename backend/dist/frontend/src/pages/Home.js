"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const auth_1 = require("../api/auth");
function Home() {
    const { data } = (0, auth_1.useGetProfile)();
    return (<material_1.Grid container height="100%" direction="column">
      <material_1.Grid item>
        <material_1.Typography variant="h1">{data && data.login42}</material_1.Typography>
      </material_1.Grid>
      
      
      
    </material_1.Grid>);
}
exports.default = Home;
//# sourceMappingURL=Home.js.map