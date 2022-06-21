"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = require("react");
const chat_1 = require("../api/chat");
const CreateRoom = () => {
    const [roomName, setRoomName] = (0, react_1.useState)("");
    const { mutate } = (0, chat_1.useCreateRoom)();
    const [checked, setChecked] = (0, react_1.useState)(false);
    const onCreateRoom = () => {
        if (!roomName)
            return;
        mutate({
            name: roomName,
            private: checked,
            password: "",
        });
    };
    (0, react_1.useEffect)(() => {
        console.log(checked);
    }, []);
    return (<material_1.Stack>
      <material_1.TextField label="room name" onChange={(e) => setRoomName(e.target.value)}/>
      <label htmlFor="private">
        private
        <material_1.Checkbox id="private" onChange={(e) => setChecked(e.target.checked)}/>
      </label>
      <material_1.Button size="small" variant="contained" onClick={() => onCreateRoom()}>
        Create Room
      </material_1.Button>
    </material_1.Stack>);
};
exports.default = CreateRoom;
//# sourceMappingURL=CreateRoom.js.map