import { Component, createSignal, Show, Suspense } from 'solid-js';
import { RoomUser } from '../types/user.interface';
import { AiOutlineMore } from 'solid-icons/ai';
import Modal from './Modal';
import { useStore } from '../store';
import { Link } from 'solid-app-router';
import Avatar from './Avatar';

const ChatRoomUserCard: Component<{ user: RoomUser; ownerId: number }> = (
  props,
) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [{ currentUser }] = useStore();

  return (
    <Suspense>
      <div class="flex items-center justify-between transition-all p-3 opacity-50 hover:opacity-100">
        <div class="flex items-center">
          <Avatar />
          <h1 class="pl-3">{props.user.display_name}</h1>
        </div>
        <Show when={currentUser.userData?.id === props.ownerId}>
          <AiOutlineMore onClick={() => setIsOpen(true)} />
        </Show>
      </div>
      <Show when={props}>
        <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
          <div class="flex flex-col p-3 border absolute shadow-md rounded-md bg-skin-page border-header-menu -top-6 right-1">
            <Link
              class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
              href={`/profile/${props.user.id}`}
            >
              Profile
            </Link>
            <button class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all">
              Mute
            </button>
            <button class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all">
              Ban
            </button>
            <button class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all">
              Promote
            </button>
            <button class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all">
              Block
            </button>
          </div>
        </Modal>
      </Show>
    </Suspense>
  );
};

export default ChatRoomUserCard;
