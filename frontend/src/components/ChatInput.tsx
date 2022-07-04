import { Button, TextField } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { RoomInfoShort } from "../types/chat.interface";

const WrapForm = styled("form")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  margin: `${theme.spacing(0)} auto`,
}));

const ChatInput = ({
  room,
  onSend,
}: {
  room?: RoomInfoShort;
  onSend: (msg: string) => void;
}) => {
  const [message, setMessage] = useState("");

  useEffect(() => { }, [room]);

  return (
    <WrapForm
      onSubmit={(e) => {
        e.preventDefault();
        onSend(message);
        setMessage("");
      }}
      autoComplete="off"
    >
      <TextField
        onChange={(e) => setMessage(e.target.value)}
        size="small"
        sx={{
          width: "100%",
          height: "auto",
        }}
        id="standard-basic"
        label="Enter message"
        value={message}
        variant="standard"
      />
      <Button
        color="primary"
        onClick={() => {
          onSend(message);
          setMessage("");
        }}
        size="small"
        variant="contained"
      >
        <SendIcon />
      </Button>
    </WrapForm>
  );
};

export default ChatInput;
