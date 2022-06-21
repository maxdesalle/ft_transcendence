"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const styles_1 = require("@mui/material/styles");
const MessageCard = (0, styles_1.styled)("div")(({}) => ({
    marginLeft: "20px",
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#A8DDFD",
    width: "60%",
    maxWidth: "300px",
    textAlign: "left",
    border: "1px solid #97C6E3",
    borderRadius: "10px",
    alignSelf: "start",
}));
const Timestamp = (0, styles_1.styled)("p")(({}) => ({
    fontSize: ".85em",
    fontWeight: "300",
    textAlign: "right",
}));
const ChatMessageLeft = ({ message, name, timestamp, }) => {
    return (<>
      <material_1.Typography pl={3}>{name}</material_1.Typography>
      <MessageCard>
        <material_1.Box>
          <material_1.Typography sx={{ overflowWrap: "break-word" }}>{message}</material_1.Typography>
        </material_1.Box>
        <Timestamp>{timestamp}</Timestamp>
      </MessageCard>
    </>);
};
exports.default = ChatMessageLeft;
//# sourceMappingURL=ChatMessageLeft.js.map