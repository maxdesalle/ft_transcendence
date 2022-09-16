import autoAnimate from '@formkit/auto-animate';
import Scrollbars from 'solid-custom-scrollbars';
import {
  Component,
  createEffect,
  createSignal,
  For,
  on,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { Message } from '../types/chat.interface';
import MessageCard from './MessageCard';

const MessageList: Component<{ messages?: Message[] }> = (props) => {
  const [blockedUsers] = createTurboResource<number[]>(() => routes.blocked);

  const [ref, setRef] = createSignal<HTMLElement>();
  onMount(() => {
    autoAnimate(ref() as any);
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

  createEffect(
    on(
      () => props.messages,
      () => {
        if (ref()) {
          ref()!.scrollTop = ref()!.scrollHeight;
        }
      },
    ),
  );

  return (
    <div
      ref={setRef}
      class="flex flex-col-reverse gap-3 bg-base-100 w-full first:mt-auto overflow-y-scroll scrollbar scrollbar-thumb-gray-700 scrollbar-track-gray-500 h-full"
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
