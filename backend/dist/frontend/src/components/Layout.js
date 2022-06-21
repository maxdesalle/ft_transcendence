"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const Container_1 = require("@mui/material/Container");
const ChatPopover_1 = require("./ChatPopover");
function Layout() {
    return (<Container_1.default sx={{ height: "89vh" }}>
      <react_router_dom_1.Outlet />
      <ChatPopover_1.default />
    </Container_1.default>);
}
exports.default = Layout;
//# sourceMappingURL=Layout.js.map