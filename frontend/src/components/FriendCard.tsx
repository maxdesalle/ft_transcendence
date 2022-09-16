import { Component, Show } from 'solid-js';
import { Friend } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import Avatar from './Avatar';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { useStore } from '../store/StoreProvider';
import { createTurboResource } from 'turbo-solid';
import { GameSession } from '../types/Game.interface';
import { urls } from '../api/utils';

export const FriendCard: Component<{
  friend: Friend;
  onClick?: () => void;
  sessionId?: number;
}> = (props) => {
  const [state] = useStore();

  const isOnline = () => state.onlineUsers.includes(props.friend.id);
  const inGame = () => state.inGameUsers.includes(props.friend.id);
  return (
    <div
      onClick={props.onClick}
      class="flex justify-between items-center w-full"
    >
      <div class="flex">
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
          class="pl-3 hidden lg:block"
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
