import { Component } from 'solid-js';
import { User } from '../types/user.interface';
import { AiOutlineUserAdd } from 'solid-icons/ai';
import Avatar from './Avatar';
import { urls } from '../api/utils';

const SearchUserCard: Component<{ user: User; onClick?: () => void }> = (
  props,
) => {
  return (
    <div class="flex items-center bg-skin-menu-background justify-between w-full p-2 rounded-sm text-white">
      <Avatar imgUrl={`${urls.backendUrl}/database-files/${props.user.avatarId}`} />
      <h1>{props.user.display_name}</h1>
      <button onClick={props.onClick} class="bg-blue-600 border rounded-full">
        <AiOutlineUserAdd />
      </button>
    </div>
  );
};

export default SearchUserCard;
