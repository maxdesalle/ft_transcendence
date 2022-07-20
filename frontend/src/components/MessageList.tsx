import Scrollbars from 'solid-custom-scrollbars';
import { Component, For, Show } from 'solid-js';
import { Message } from '../types/chat.interface';
import MessageCard from './MessageCard';

const MessageList: Component<{ messages?: Message[]; id?: number }> = (
  props,
) => {
  return (
    <Show when={props.messages}>
      <Scrollbars class="flex flex-col overflow-y-scroll h-82">
        <For each={props.messages}>
          {(msg) => (
            <MessageCard
              title={msg.user_id === props.id ? '' : `username`}
              message={msg}
              position={
                msg.user_id === props.id ? 'bg-blue-400' : 'bg-orange-400'
              }
            />
          )}
        </For>
      </Scrollbars>
    </Show>
  );
};

export default MessageList;
