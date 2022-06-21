import {
  Paper,
  Avatar,
  Stack,
  Typography,
  Box,
  styled,
  TextField,
  Button,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGetProfile } from "../api/auth";
import { useGetMessagesByRoomId, useGetRooms, usePostDm } from "../api/chat";
import { Message, RoomInfoShort } from "../types/chat";
import { compareAsc, format, parseISO } from "date-fns";
import ChatMessageLeft from "./ChatMessageLeft";
import ChatMessageRight from "./ChatMessageRight";
import { urls } from "../api/utils";
import SendIcon from "@mui/icons-material/Send";
import useWebSocket from "react-use-websocket";
const WrapForm = styled("form")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  width: "100%",
  margin: `${theme.spacing(0)} auto`,
}));

const Chat = () => {
  const [message, setMessage] = useState("");
  const { data } = useGetRooms();
  const [selectedRoom, setSelectedRoom] = useState<RoomInfoShort>();
  const [roomId, setRoomId] = useState<number | undefined>();
  const { messages } = useGetMessagesByRoomId(roomId);
  const [wsMessages, setWsMessages] = useState<Message[]>([]);
  const { data: user } = useGetProfile();
  const { mutate } = usePostDm();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const {} = useWebSocket(urls.wsUrl, {
    onMessage: (e) => {
      let data = JSON.parse(e.data);
      onUpdate(data.message);
    },
  });

  const onUpdate = useCallback(
    (msg: Message) => {
      setWsMessages((state) => [...state, msg]);
    },
    [setWsMessages]
  );

  const onSelectRoom = (room: RoomInfoShort) => {
    setSelectedRoom((old) => ({ ...old, ...room }));
    setRoomId(room.room_id);
    setWsMessages([]);
  };

  const onSend = (msg: string) => {
    if (selectedRoom && msg) {
      mutate({
        room_id: selectedRoom.room_id,
        message: msg,
      });
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo(0, chatRef.current.scrollHeight as number);
    }
    console.log(wsMessages);
  }, [wsMessages, messages]);

  const renderRooms = () => {
    return (
      <Stack component="div" spacing={1} p={1}>
        {data &&
          data.map((room) => (
            <Box
              component="button"
              onClick={() => onSelectRoom(room)}
              key={room.room_id}
              sx={{ display: "flex", padding: "3px", borderRadius: "5px" }}
            >
              <Avatar />
              <Stack pl={2}>
                <Typography textAlign="start">{room.room_name}</Typography>
                <Typography component="p">last message</Typography>
              </Stack>
            </Box>
          ))}
      </Stack>
    );
  };

  return (
    <Paper
      sx={{
        padding: 1,
        width: "400px",
        maxHeight: "600px",
        height: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {selectedRoom && <Typography>{selectedRoom.room_name}</Typography>}
      <Paper
        ref={chatRef}
        component="div"
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          overflowY: "scroll",
          height: "calc(100% - 40px)",
        }}
      >
        {!messages && renderRooms()}
        {messages &&
          messages
            .concat(wsMessages)
            .sort((a, b) =>
              compareAsc(
                parseISO(a.timestamp.toString()),
                parseISO(b.timestamp.toString())
              )
            )
            .map((msg) => (
              <Stack key={msg.id}>
                {user && user.id == msg.user_id ? (
                  <ChatMessageRight
                    timestamp={format(parseISO(msg.timestamp.toString()), "pp")}
                    message={msg.message}
                  />
                ) : (
                  <ChatMessageLeft
                    name={msg.chosen_name}
                    timestamp={format(parseISO(msg.timestamp.toString()), "pp")}
                    message={msg.message}
                  />
                )}
              </Stack>
            ))}
      </Paper>
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
    </Paper>
  );
};

export default Chat;
