import { compareAsc, parseISO } from 'date-fns';
import { Component, createSignal, Show } from 'solid-js';
import MessageList from './MessageList';
import ChatForm from './ChatForm';
import { Message } from '../types/chat.interface';
import { useAuth } from '../Providers/AuthProvider';
import { useStore } from '../store/all';

const ChatMessagesBox: Component<{
  onSendMessage: (message: string) => void;
  messages: Message[];
}> = (props) => {
  const [message, setMessage] = createSignal('');
  const [auth] = useAuth();
  const [state] = useStore();

  return (
    <>
      <Show when={state.chat.roomId || state.chat.friendId}>
        <MessageList
          messages={props.messages
            .slice()
            .sort((a, b) =>
              compareAsc(
                parseISO(b.timestamp.toString()),
                parseISO(a.timestamp.toString()),
              ),
            )}
          id={auth.user.id}
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
