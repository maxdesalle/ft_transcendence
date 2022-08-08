import { compareAsc, parseISO } from 'date-fns';
import { Component, createEffect, createSignal, Show } from 'solid-js';
import MessageList from './MessageList';
import { useStore } from '../store';
import ChatForm from './ChatForm';
import { Message } from '../types/chat.interface';
import PendingFriendReqCard from './PendingFriendReqCard';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import toast from 'solid-toast';

const ChatMessagesBox: Component<{
  onSendMessage: (message: string) => void;
  messages: Message[];
}> = (props) => {
  const [state, { loadMessages }] = useStore();
  const [currentUser] = createTurboResource(() => routes.currentUser);

  const [message, setMessage] = createSignal('');
  const [messages, { mutate }] = createTurboResource(
    () => `${routes.roomMessages}/${room_id()}`,
  );

  const room_id = () => state.chat.roomId;

  createEffect(() => {
    if (loadMessages && state.chat.currentRoom) {
      loadMessages(state.chat.currentRoom.room_id);
    }
  });

  return (
    <>
      <Show
        when={state.chatUi.showMessages}
        fallback={<PendingFriendReqCard />}
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
