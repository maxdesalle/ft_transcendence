import { compareAsc, parseISO } from 'date-fns';
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import MessageList from './MessageList';
import { useStore } from '../store';
import ChatForm from './ChatForm';
import { urls } from '../api/utils';
import { Message } from '../types/chat.interface';
import PendingFriendReqCard from './PendingFriendReqCard';

//TODO: put input here and add a function as prop
const ChatMessagesBox: Component<{
  onSendMessage: (message: string) => void;
  messages: Message[];
}> = (props) => {
  const [state, { loadMessages, mutateRoomMsgs: mutateRoomMsgs, mutateFriendMsgs }] =
    useStore();

  const [message, setMessage] = createSignal('');
  let ws: WebSocket;

  onMount(() => {
    ws = new WebSocket(urls.wsUrl);
    ws.addEventListener('message', ({ data }) => {
      const res = JSON.parse(data);
      if (res.event === 'chat_room_msg') {
        if (mutateRoomMsgs) {
          mutateRoomMsgs(res.message as Message);
        }
      } else if (res.event == 'chat_dm') {
        if (mutateFriendMsgs) {
          mutateFriendMsgs(res.message as Message);
        }
      }
    });
  });

  createEffect(() => {
    if (loadMessages && state.chat.currentRoom) {
      loadMessages(state.chat.currentRoom.room_id);
    }
  });

  onCleanup(() => {
    ws.close();
  });

  return (
    <>
      <Show when={state.chatUi.showMessages} fallback={<PendingFriendReqCard />}>
        <MessageList
          messages={props.messages
            .slice()
            .sort((a, b) =>
              compareAsc(
                parseISO(a.timestamp.toString()),
                parseISO(b.timestamp.toString()),
              ),
            )}
          id={state.currentUser.userData?.id}
        />
        <ChatForm
          message={message()}
          setMessage={setMessage}
          onSendMessage={(msg) => {
            props.onSendMessage(msg);
            setMessage('');
          }}
        />
      </Show>
    </>
  );
};

export default ChatMessagesBox;
