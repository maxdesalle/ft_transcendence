import autoAnimate from '@formkit/auto-animate';
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
  let ref: any;
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

  onMount(() => {
    autoAnimate(ref);
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', () => {});
  });

  return (
    <div
      ref={ref}
      class="flex flex-col-reverse gap-3 bg-skin-menu-background w-full first:mt-auto overflow-y-scroll scrollbar scrollbar-thumb-gray-700 scrollbar-track-gray-500 h-full"
    >
      <For each={props.messages}>
        {(msg) => (
          <Show when={blockedUsers() && !blockedUsers()!.includes(msg.user_id)}>
            <MessageCard message={msg} />
          </Show>
        )}
      </For>
    </div>
  );
};

export default MessageList;
