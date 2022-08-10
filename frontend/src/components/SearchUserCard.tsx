import { Component } from 'solid-js';
import { User } from '../types/user.interface';
import { AiOutlineUserAdd } from 'solid-icons/ai';
import Avatar from './Avatar';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { generateImageUrl } from '../utils/helpers';
import { CgProfile } from 'solid-icons/cg';
import { useNavigate } from 'solid-app-router';

const SearchUserCard: Component<{ user: User; onClick?: () => void }> = (
  props,
) => {
  const navigate = useNavigate();
  return (
    <div class="flex items-center bg-skin-menu-background justify-between w-full p-2 rounded-sm text-white">
      <div class="flex items-center">
        <Avatar
          imgUrl={
            props.user.avatarId
              ? `${generateImageUrl(props.user.avatarId)}`
              : defaultAvatar
          }
        />
        <h1 class="pl-2">{props.user.display_name}</h1>
      </div>
      <div class="flex">
        <button
          onClick={props.onClick}
          class="border border-blue-600 rounded-full"
        >
          <AiOutlineUserAdd size={15} class="rounded-full bg-blue-600" />
        </button>
        <button
          onClick={() => navigate(`/profile/${props.user.id}`)}
          class="bg-blue-600 rounded-full"
        >
          <CgProfile size={20} class="bg-blue-600 rounded-full" />
        </button>
      </div>
    </div>
  );
};

export default SearchUserCard;
