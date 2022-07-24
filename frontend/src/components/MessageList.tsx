import Scrollbars from 'solid-custom-scrollbars';
import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { useStore } from '../store';
import { Message } from '../types/chat.interface';
import MessageCard from './MessageCard';

const MessageList: Component<{ messages?: Message[]; id?: number }> = (
  props,
) => {
  const [state, { loadFriendMessages }] = useStore();

  let scrollbarRef: any;
  createEffect(() => {
    props.messages;
    console.log(scrollbarRef);
  });

  return (
    <Show when={props.messages}>
      <div ref={scrollbarRef} class="flex flex-col overflow-y-scroll h-82">
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
      </div>
    </Show>
  );
};

export default MessageList;
