import { compareAsc, parseISO } from 'date-fns';
import { Component, createSignal, Show } from 'solid-js';
import MessageList from './MessageList';
import ChatForm from './ChatForm';
import { Message } from '../types/chat.interface';

const ChatMessagesBox: Component<{
  onSendMessage: (message: string) => void;
  messages: Message[];
}> = (props) => {
  const [message, setMessage] = createSignal('');

  return (
    <>
      <Show when={props.messages}>
        <MessageList
          messages={props.messages
            .slice()
            .sort((a, b) =>
              compareAsc(
                parseISO(b.timestamp.toString()),
                parseISO(a.timestamp.toString()),
              ),
            )}
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
