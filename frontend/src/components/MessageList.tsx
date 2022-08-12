import {
  Component,
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { Message } from '../types/chat.interface';
import MessageCard from './MessageCard';

const MessageList: Component<{ messages?: Message[]; id?: number }> = (
  props,
) => {
  createEffect(() => {
    props.messages;
    //TODO: Srool bottom
  });

  const [roomId, setRoomId] = createSignal(0);

  onMount(() => {
    document.addEventListener(
      'mousedown',
      function (event) {
        if (event.detail > 1) {
          event.preventDefault();
        }
      },
      false,
    );
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', () => { });
  });

  return (
    <Show when={props.messages}>
      <div class="flex flex-col first:mt-auto overflow-y-scroll scrollbar scrollbar-thumb-gray-700 scrollbar-track-gray-500 h-82">
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
