import { compareAsc, parseISO } from 'date-fns';
import {
  Component,
  createEffect,
  createResource,
  createSignal,
  Show,
} from 'solid-js';
import MessageList from './MessageList';
import { useStore } from '../store';
import ChatForm from './ChatForm';
import { Message, RoomInfo } from '../types/chat.interface';
import PendingFriendReqCard from './PendingFriendReqCard';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import toast from 'solid-toast';
import { api } from '../utils/api';

const ChatMessagesBox: Component<{
  onSendMessage: (message: string) => void;
  messages: Message[];
}> = (props) => {
  const [state, { loadMessages }] = useStore();
  const [currentUser] = createTurboResource(() => routes.currentUser);
  const roomId = state.chat.roomId;
  const [message, setMessage] = createSignal('');
  const [currentRoom, { mutate }] = createResource(
    roomId,
    async (id: number) => {
      const res = await api.get<RoomInfo>(`${routes.chat}/room_info/${id}`);
      return res.data;
    },
  );

  const room_id = () => state.chat.roomId;

  createEffect(() => {
    if (loadMessages && currentRoom()) {
      loadMessages(currentRoom()!.room_id);
    }
  });

  return (
    <>
      <Show
        when={state.chatUi.showMessages}
      >
        <MessageList
          messages={props.messages
            .slice()
            .sort((a, b) =>
              compareAsc(
                parseISO(a.timestamp.toString()),
                parseISO(b.timestamp.toString()),
              ),
            )}
          id={currentUser()?.id}
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
