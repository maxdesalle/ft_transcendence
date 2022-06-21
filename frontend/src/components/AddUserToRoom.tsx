import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useAddUserToRoom, useGetRooms } from "../api/chat";

const AddUserToRoom = () => {
  const { data } = useGetRooms();
  const [roomName, setRoomName] = useState("");
  const [userId, setUserId] = useState<number>();
  const { mutate } = useAddUserToRoom();

  const handleChange = (e: SelectChangeEvent) => {
    setRoomName(e.target.value);
  };

  const addUser = () => {
    if (!userId || !roomName) return;
    const room = data?.find((room) => room.room_name == roomName);
    mutate({ room_id: room?.room_id, user_id: userId });
  };
  return (
    <Stack spacing={4}>
      <TextField
        type="number"
        label="user id"
        onChange={(e) => setUserId(parseInt(e.target.value))}
      />

      <FormControl fullWidth>
        <InputLabel id="rooms">Rooms</InputLabel>
        <Select
          labelId="rooms"
          id="rooms-select"
          value={roomName}
          onChange={handleChange}
        >
          {data &&
            data.map((room) => (
              <MenuItem value={room.room_name} key={room.room_id}>
                {room.room_name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <Button onClick={() => addUser()} variant="contained">
        Add user
      </Button>
    </Stack>
  );
};

export default AddUserToRoom;
