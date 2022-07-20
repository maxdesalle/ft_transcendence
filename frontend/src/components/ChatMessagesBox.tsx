import { compareAsc, parseISO } from 'date-fns';
import { IoSend } from 'solid-icons/io';
import {
  Component,
  createEffect,
  createSignal,
  onMount,
  Show,
  Suspense,
} from 'solid-js';
import { Message, RoomInfoShort } from '../types/chat.interface';
import { User } from '../types/user.interface';
import Avatar from './Avatar';
import MessageList from './MessageList';
import Scrollbars from 'solid-custom-scrollbars';
import { useStore } from '../store';
import PendingFriendReqCard from './PendingFriendReqCard';

const ChatMessagesBox: Component<{}> = () => {
  const [state] = useStore();

  return (
    <Show
      when={state.chat.currentRoom && state.currentUser.userData}
      fallback={<PendingFriendReqCard />}
    >
      <div class="flex p-2 items-center shadow- border-b border-b-header-menu">
        <Avatar />
        <p>{state.chat.currentRoom!.room_name}</p>
      </div>
      <Suspense>
        <Show when={state.chat.messages}>
          <MessageList
            messages={state.chat
              .messages!.slice()
              .sort((a, b) =>
                compareAsc(
                  parseISO(a.timestamp.toString()),
                  parseISO(b.timestamp.toString()),
                ),
              )}
            id={state.currentUser.userData?.id}
          />
        </Show>
      </Suspense>
    </Show>
  );
};

export default ChatMessagesBox;
