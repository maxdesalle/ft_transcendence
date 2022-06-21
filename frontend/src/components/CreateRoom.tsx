import { Button, Checkbox, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useCreateRoom } from "../api/chat";

const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const { mutate } = useCreateRoom();
  const [checked, setChecked] = useState(false);

  const onCreateRoom = () => {
    if (!roomName) return;
    mutate({
      name: roomName,
      private: checked,
      password: "",
    });
  };

  useEffect(() => {
    console.log(checked);
  }, []);

  return (
    <Stack>
      <TextField
        label="room name"
        onChange={(e) => setRoomName(e.target.value)}
      />
      <label htmlFor="private">
        private
        <Checkbox id="private" onChange={(e) => setChecked(e.target.checked)} />
      </label>
      <Button size="small" variant="contained" onClick={() => onCreateRoom()}>
        Create Room
      </Button>
    </Stack>
  );
};

export default CreateRoom;
