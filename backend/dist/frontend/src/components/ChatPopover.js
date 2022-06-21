"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const Chat_1 = require("@mui/icons-material/Chat");
const system_1 = require("@mui/system");
const react_1 = require("react");
const Chat_2 = require("./Chat");
const ChatPopover = () => {
    const [anchorEl, setAnchorEl] = (0, react_1.useState)(null);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;
    return (<system_1.Box sx={{
            display: "flex",
            justifyContent: "end",
        }}>
      <material_1.Button onClick={handleClick}>
        <Chat_1.default />
      </material_1.Button>
      <material_1.Popover id={id} open={open} anchorEl={anchorEl} onClose={handleClose} anchorOrigin={{
            vertical: "top",
            horizontal: "left",
        }}>
        <Chat_2.default />
      </material_1.Popover>
    </system_1.Box>);
};
exports.default = ChatPopover;
//# sourceMappingURL=ChatPopover.js.map