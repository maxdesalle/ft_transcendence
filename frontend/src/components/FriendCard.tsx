import { Component, Show } from 'solid-js';
import { Friend } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import Avatar from './Avatar';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { useStore } from '../store/all';

export const FriendCard: Component<{ friend: Friend; onClick?: () => void }> = (
  props,
) => {
  const [state] = useStore();

  const isOnline = () => state.onlineUsers.includes(props.friend.id);
  const inGame = () => state.inGameUsers.includes(props.friend.id);
  return (
    <div
      onClick={props.onClick}
      class="flex text-white justify-between items-center w-full"
    >
      <div class="flex sm:m-auto md:m-0">
        <Avatar
          color={isOnline() ? 'bg-green-400' : 'bg-red-400'}
          imgUrl={
            props.friend.avatarId
              ? `${generateImageUrl(props.friend.avatarId)}`
              : defaultAvatar
          }
        />
        <div
          classList={{ 'animate-pulse': inGame() }}
          class="pl-3 hidden md:block"
        >
          <h4>{props.friend.display_name}</h4>
          <Show
            when={!inGame()}
            fallback={<p class="text-indigo-500">In Game</p>}
          >
            <p
              classList={{
                'text-green-400': isOnline(),
                'text-red-400': !isOnline(),
              }}
            >
              {isOnline() ? 'online' : 'offline'}
            </p>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default FriendCard;
