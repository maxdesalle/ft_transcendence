"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const Send_1 = require("@mui/icons-material/Send");
const styles_1 = require("@mui/material/styles");
const react_1 = require("react");
const WrapForm = (0, styles_1.styled)("form")(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    width: "100%",
    margin: `${theme.spacing(0)} auto`,
}));
const ChatInput = ({ room, onSend, }) => {
    const [message, setMessage] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => { }, [room]);
    return (<WrapForm onSubmit={(e) => {
            e.preventDefault();
            onSend(message);
            setMessage("");
        }} autoComplete="off">
      <material_1.TextField onChange={(e) => setMessage(e.target.value)} size="small" sx={{
            width: "100%",
            height: "auto",
        }} id="standard-basic" label="Enter message" value={message} variant="standard"/>
      <material_1.Button color="primary" onClick={() => {
            onSend(message);
            setMessage("");
        }} size="small" variant="contained">
        <Send_1.default />
      </material_1.Button>
    </WrapForm>);
};
exports.default = ChatInput;
//# sourceMappingURL=ChatInput.js.map