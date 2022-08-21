import { format, parseISO } from 'date-fns';
import { Component, createResource, Show } from 'solid-js';
import { fetchUserById } from '../api/user';
import { Message } from '../types/chat.interface';
import { generateImageUrl } from '../utils/helpers';
import Avatar from './Avatar';

const MessageCard: Component<{
  message: Message;
}> = ({ message }) => {
  const [user] = createResource(() => message.user_id, fetchUserById);

  return (
    <Show when={user()}>
      <div class="flex items-center pl-3 pb-1 hover:bg-slate-800 transition-all">
        <Avatar
          imgUrl={
            user()!.avatarId ? generateImageUrl(user()!.avatarId) : undefined
          }
        />
        <div class={`opacity-90 text-right pl-3 text-white max-w-xs w-full`}>
          <div class="flex items-center">
            <p class="text-base">{message.display_name}</p>
            <p class="p-1 text-xs text-gray-500">
              {format(parseISO(message.timestamp.toString()), 'pp')}
            </p>
          </div>
          <p class="text-left text-sm font-thin">{message.message}</p>
        </div>
      </div>
    </Show>
  );
};

export default MessageCard;
