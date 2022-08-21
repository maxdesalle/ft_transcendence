import {
  Component,
  createEffect,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { Message } from '../types/chat.interface';
import MessageCard from './MessageCard';

const MessageList: Component<{ messages?: Message[]; id?: number }> = (
  props,
) => {
  createEffect(() => {
    props.messages;
    //TODO: Srool bottom
  });

  const [blockedUsers] = createTurboResource<number[]>(() => routes.blocked);

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
    document.removeEventListener('mousedown', () => {});
  });

  return (
    <Show when={props.messages}>
      <div class="flex flex-col w-full first:mt-auto overflow-y-scroll scrollbar scrollbar-thumb-gray-700 scrollbar-track-gray-500 h-82">
        <For each={props.messages}>
          {(msg) => (
            <Show
              when={blockedUsers() && !blockedUsers()!.includes(msg.user_id)}
            >
              <MessageCard
                title={msg.user_id === props.id ? '' : `username`}
                message={msg}
                position={
                  msg.user_id === props.id ? 'bg-blue-400' : 'bg-orange-400'
                }
              />
            </Show>
          )}
        </For>
      </div>
    </Show>
  );
};

export default MessageList;
