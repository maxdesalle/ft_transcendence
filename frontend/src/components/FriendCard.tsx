import { Component } from 'solid-js';
import { Friend } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import Avatar from './Avatar';
import defaultAvatar from '../../../backend/images/avatardefault.png';

export const FriendCard: Component<{ friend: Friend; onClick?: () => void }> = (
  props,
) => {
  return (
    <div
      onClick={props.onClick}
      class="flex text-white justify-between items-center w-full"
    >
      <div class="flex">
        <Avatar
          color={props.friend.status === 'online' ? 'green' : 'red'}
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
