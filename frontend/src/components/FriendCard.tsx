import { Component } from 'solid-js';
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
  return (
    <div
      onClick={props.onClick}
      class="flex text-white justify-between items-center w-full"
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
        <h4 class="hidden lg:block pl-3">{props.friend.display_name}</h4>
      </div>
    </div>
  );
};

export default FriendCard;
