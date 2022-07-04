import { ArrowBack } from '@mui/icons-material';
import SendIcon from '@mui/icons-material/Send';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { compareAsc, format, parseISO } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useGetProfile } from '../api/auth';
import { usePostMsgToRoom } from '../api/chat';
import { useSendDmToFriend } from '../api/friends';
import { urls } from '../api/utils';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  addMessage,
  changeStatus,
  fetchFriendMessage,
  fetchMessages,
  resetMessages,
} from '../features/Chat/ChatSlice';
import { RoomInfoShort } from '../types/chat.interface';
import { User } from '../types/user.interface';
import ChatBackButton from './ChatBackButton';
import ChatMessageLeft from './ChatMessageLeft';
import ChatMessageRight from './ChatMessageRight';
import ChatTabs from './ChatTabs';

const WrapForm = styled('form')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  margin: `${theme.spacing(0)} auto`,
}));

const Chat = () => {
  const [message, setMessage] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomInfoShort>();
  const [room_id, setRoomId] = useState<number | undefined>();
  const [user_id, setFriendId] = useState<number | undefined>();
  const [selectedFriend, setSelectedFriend] = useState<User | undefined>();
  const messages = useAppSelector((state) => state.chat.messages);
  const status = useAppSelector((state) => state.chat.status);
  const dispatch = useAppDispatch();
  const { data: user } = useGetProfile();
  const { mutate: mutateRoomMsg } = usePostMsgToRoom();
  const { mutate: mutateFriendMsg } = useSendDmToFriend();
  const [receiver, setReceiver] = useState<string | undefined>();
  const chatRef = useRef<HTMLDivElement | null>(null);
  const {} = useWebSocket(urls.wsUrl, {
    onMessage: (e) => {
      const data = JSON.parse(e.data);
      if (data.event === 'chat_dm' || data.event === 'chat_room_msg') {
        dispatch(addMessage(data.message));
      }
    },
  });

  const resetAll = useCallback(() => {
    dispatch(resetMessages());
    setFriendId(undefined);
    setRoomId(undefined);
  }, []);
  const onSelectRoom = useCallback(
    (room: RoomInfoShort) => {
      setSelectedRoom(() => ({ ...room }));
      setRoomId(room.room_id);
      setReceiver('room');
    },
    [setSelectedRoom, setRoomId, setReceiver],
  );

  const onSelectFriend = useCallback(
    (friend: User) => {
      setSelectedFriend(() => ({ ...friend }));
      setFriendId(friend.id);
      setReceiver('friend');
    },
    [setSelectedFriend, setFriendId, setReceiver],
  );

  const onSend = useCallback(
    (msg: string) => {
      if (selectedRoom && msg && receiver === 'room') {
        mutateRoomMsg({
          room_id: selectedRoom.room_id,
          message: msg,
        });
      }
      if (selectedFriend && msg && receiver === 'friend') {
        mutateFriendMsg({
          user_id: selectedFriend.id,
          message: msg,
        });
      }
    },
    [message],
  );

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo(0, chatRef.current.scrollHeight as number);
    }
    if (receiver === 'room' && room_id) {
      dispatch(fetchMessages(room_id));
    }
    if (receiver == 'friend' && user_id) {
      dispatch(fetchFriendMessage(user_id));
    }
    return () => {
      dispatch(resetMessages());
    };
  }, [room_id, receiver, user_id]);

  return (
    <Paper
      sx={{
        padding: 1,
        width: '400px',
        maxHeight: '600px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {status === 'success' ? (
        <Box>
          <ChatBackButton onClick={resetAll} />
        </Box>
      ) : null}
      <Paper
        component="div"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          overflowY: status === 'success' ? 'scroll' : 'hidden',
          height: '100%',
        }}
      >
        {status === 'idle' ? (
          <ChatTabs
            onSelectRoom={onSelectRoom}
            onSelectFriend={onSelectFriend}
          />
        ) : status === 'success' ? (
          <>
            {messages
              .slice()
              .sort((a, b) =>
                compareAsc(
                  parseISO(a.timestamp.toString()),
                  parseISO(b.timestamp.toString()),
                ),
              )
              .map((msg) => (
                <Stack ref={chatRef} key={msg.id}>
                  {user && user.id == msg.user_id ? (
                    <ChatMessageRight
                      timestamp={format(
                        parseISO(msg.timestamp.toString()),
                        'pp',
                      )}
                      message={msg.message}
                    />
                  ) : (
                    <ChatMessageLeft
                      name={msg.chosen_name}
                      timestamp={format(
                        parseISO(msg.timestamp.toString()),
                        'pp',
                      )}
                      message={msg.message}
                    />
                  )}
                </Stack>
              ))}
          </>
        ) : null}
      </Paper>
      {status === 'success' ? (
        <WrapForm
          onSubmit={(e) => {
            e.preventDefault();
            onSend(message);
            setMessage('');
          }}
          autoComplete="off"
        >
          <TextField
            onChange={(e) => setMessage(e.target.value)}
            size="small"
            sx={{
              width: '100%',
              height: 'auto',
            }}
            id="standard-basic"
            label="Enter message"
            value={message}
            variant="standard"
            autoFocus={true}
          />
          <Button
            color="primary"
            onClick={() => {
              onSend(message);
              setMessage('');
            }}
            size="small"
            variant="contained"
          >
            <SendIcon />
          </Button>
        </WrapForm>
      ) : null}
    </Paper>
  );
};

export default Chat;
