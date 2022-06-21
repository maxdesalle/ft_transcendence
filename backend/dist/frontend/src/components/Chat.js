"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = require("react");
const auth_1 = require("../api/auth");
const chat_1 = require("../api/chat");
const date_fns_1 = require("date-fns");
const ChatMessageLeft_1 = require("./ChatMessageLeft");
const ChatMessageRight_1 = require("./ChatMessageRight");
const utils_1 = require("../api/utils");
const Send_1 = require("@mui/icons-material/Send");
const react_use_websocket_1 = require("react-use-websocket");
const WrapForm = (0, material_1.styled)("form")(({ theme }) => ({
    display: "flex",
    justifyContent: "center",
    width: "100%",
    margin: `${theme.spacing(0)} auto`,
}));
const Chat = () => {
    const [message, setMessage] = (0, react_1.useState)("");
    const { data } = (0, chat_1.useGetRooms)();
    const [selectedRoom, setSelectedRoom] = (0, react_1.useState)();
    const [roomId, setRoomId] = (0, react_1.useState)();
    const { messages } = (0, chat_1.useGetMessagesByRoomId)(roomId);
    const [wsMessages, setWsMessages] = (0, react_1.useState)([]);
    const { data: user } = (0, auth_1.useGetProfile)();
    const { mutate } = (0, chat_1.usePostDm)();
    const chatRef = (0, react_1.useRef)(null);
    const {} = (0, react_use_websocket_1.default)(utils_1.urls.wsUrl, {
        onMessage: (e) => {
            let data = JSON.parse(e.data);
            onUpdate(data.message);
        },
    });
    const onUpdate = (0, react_1.useCallback)((msg) => {
        setWsMessages((state) => [...state, msg]);
    }, [setWsMessages]);
    const onSelectRoom = (room) => {
        setSelectedRoom((old) => (Object.assign(Object.assign({}, old), room)));
        setRoomId(room.room_id);
        setWsMessages([]);
    };
    const onSend = (msg) => {
        if (selectedRoom && msg) {
            mutate({
                room_id: selectedRoom.room_id,
                message: msg,
            });
        }
    };
    (0, react_1.useEffect)(() => {
        if (chatRef.current) {
            chatRef.current.scrollTo(0, chatRef.current.scrollHeight);
        }
        console.log(wsMessages);
    }, [wsMessages, messages]);
    const renderRooms = () => {
        return (<material_1.Stack component="div" spacing={1} p={1}>
        {data &&
                data.map((room) => (<material_1.Box component="button" onClick={() => onSelectRoom(room)} key={room.room_id} sx={{ display: "flex", padding: "3px", borderRadius: "5px" }}>
              <material_1.Avatar />
              <material_1.Stack pl={2}>
                <material_1.Typography textAlign="start">{room.room_name}</material_1.Typography>
                <material_1.Typography component="p">last message</material_1.Typography>
              </material_1.Stack>
            </material_1.Box>))}
      </material_1.Stack>);
    };
    return (<material_1.Paper sx={{
            padding: 1,
            width: "400px",
            maxHeight: "600px",
            height: "80vh",
            display: "flex",
            flexDirection: "column",
        }}>
      {selectedRoom && <material_1.Typography>{selectedRoom.room_name}</material_1.Typography>}
      <material_1.Paper ref={chatRef} component="div" sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            overflowY: "scroll",
            height: "calc(100% - 40px)",
        }}>
        {!messages && renderRooms()}
        {messages &&
            messages
                .concat(wsMessages)
                .sort((a, b) => (0, date_fns_1.compareAsc)((0, date_fns_1.parseISO)(a.timestamp.toString()), (0, date_fns_1.parseISO)(b.timestamp.toString())))
                .map((msg) => (<material_1.Stack key={msg.id}>
                {user && user.id == msg.user_id ? (<ChatMessageRight_1.default timestamp={(0, date_fns_1.format)((0, date_fns_1.parseISO)(msg.timestamp.toString()), "pp")} message={msg.message}/>) : (<ChatMessageLeft_1.default name={msg.chosen_name} timestamp={(0, date_fns_1.format)((0, date_fns_1.parseISO)(msg.timestamp.toString()), "pp")} message={msg.message}/>)}
              </material_1.Stack>))}
      </material_1.Paper>
      <WrapForm onSubmit={(e) => {
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
      </WrapForm>
    </material_1.Paper>);
};
exports.default = Chat;
//# sourceMappingURL=Chat.js.map