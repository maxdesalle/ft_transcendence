"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const styles_1 = require("@mui/material/styles");
const system_1 = require("@mui/system");
const MessageCard = (0, styles_1.styled)("div")(({}) => ({
    marginRight: "20px",
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#f8e896",
    width: "60%",
    maxWidth: "300px",
    textAlign: "left",
    border: "1px solid #dfd087",
    borderRadius: "10px",
    alignSelf: "end",
}));
const Timestamp = (0, styles_1.styled)("p")(({}) => ({
    fontSize: ".85em",
    fontWeight: "300",
    textAlign: "right",
}));
const ChatMessageRight = ({ message, timestamp, }) => {
    return (<MessageCard>
      <system_1.Box component="div">
        <material_1.Typography sx={{ overflowWrap: "break-word" }} fontSize={15} m={0} p={0} paragraph>
          {message}
        </material_1.Typography>
      </system_1.Box>
      <Timestamp>{timestamp}</Timestamp>
    </MessageCard>);
};
exports.default = ChatMessageRight;
//# sourceMappingURL=ChatMessageRight.js.map