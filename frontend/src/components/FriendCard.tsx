import { Component, createEffect, createSignal } from 'solid-js';
import { Friend, User } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import Avatar from './Avatar';
import defaultAvatar from '../../../backend/images/avatardefault.png';
import { AiOutlineMore } from 'solid-icons/ai';
import Modal from './Modal';
import { blockUser } from '../api/chat';

export const FriendCard: Component<{ friend: Friend; onClick?: () => void }> = (
  props,
) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const onBlockUser = () => {
    blockUser({ user_id: props.friend.id })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div class="flex text-white justify-between items-center w-full">
      <div onClick={props.onClick} class="flex">
        <Avatar
          type="rounded-full"
          imgUrl={
            props.friend.avatarId
              ? `${generateImageUrl(props.friend.avatarId)}`
              : defaultAvatar
          }
        />
        <h4 class="pl-3">{props.friend.display_name}</h4>
      </div>
      <AiOutlineMore onClick={() => setIsOpen(true)} />
      <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
        <ul class="absolute bg-skin-page w-40 text-white left-40">
          <li class="p-2">
            <button onClick={onBlockUser} class="btn-primary w-fit">
              Block
            </button>
          </li>
          <li class="p-2">Invite to game</li>
        </ul>
      </Modal>
    </div>
  );
};

export default FriendCard;
