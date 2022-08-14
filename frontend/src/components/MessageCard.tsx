import { format, parseISO } from 'date-fns';
import { Component, Show } from 'solid-js';
import { Message } from '../types/chat.interface';

const MessageCard: Component<{
  message: Message;
  position?: string;
  color?: string;
  title?: string;
}> = ({ title, message, position, color }) => {
  return (
    <>
      <div
        class={`opacity-90 text-right border ${color} max-w-xs rounded-md w-full ${position}`}
      >
        <p class="p-1">{message.message}</p>
        <p class="p-1">
          {format(parseISO(message.timestamp.toString()), 'pp')}
        </p>
      </div>
    </>
  );
};

export default MessageCard;
