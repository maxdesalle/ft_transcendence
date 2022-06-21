"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const material_1 = require("@mui/material");
const react_1 = require("react");
const chat_1 = require("../api/chat");
const AddUserToRoom = () => {
    const { data } = (0, chat_1.useGetRooms)();
    const [roomName, setRoomName] = (0, react_1.useState)("");
    const [userId, setUserId] = (0, react_1.useState)();
    const { mutate } = (0, chat_1.useAddUserToRoom)();
    const handleChange = (e) => {
        setRoomName(e.target.value);
    };
    const addUser = () => {
        if (!userId || !roomName)
            return;
        const room = data === null || data === void 0 ? void 0 : data.find((room) => room.room_name == roomName);
        mutate({ room_id: room === null || room === void 0 ? void 0 : room.room_id, user_id: userId });
    };
    return (<material_1.Stack spacing={4}>
      <material_1.TextField type="number" label="user id" onChange={(e) => setUserId(parseInt(e.target.value))}/>

      <material_1.FormControl fullWidth>
        <material_1.InputLabel id="rooms">Rooms</material_1.InputLabel>
        <material_1.Select labelId="rooms" id="rooms-select" value={roomName} onChange={handleChange}>
          {data &&
            data.map((room) => (<material_1.MenuItem value={room.room_name} key={room.room_id}>
                {room.room_name}
              </material_1.MenuItem>))}
        </material_1.Select>
      </material_1.FormControl>
      <material_1.Button onClick={() => addUser()} variant="contained">
        Add user
      </material_1.Button>
    </material_1.Stack>);
};
exports.default = AddUserToRoom;
//# sourceMappingURL=AddUserToRoom.js.map