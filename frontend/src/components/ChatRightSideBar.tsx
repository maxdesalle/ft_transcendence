import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { AiOutlinePlusCircle } from 'solid-icons/ai';
import Modal from './Modal';
import AddUserToRoom from './admin/AddUserToRoom';
import { useStore } from '../store';
import Avatar from './Avatar';
import ChatRoomUserCard from './ChatRoomUserCard';
import { unwrap } from 'solid-js/store';
import { RoomUser } from '../types/user.interface';

const ChatRightSideBar: Component<{}> = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [state] = useStore();
  const [owner, setOwner] = createSignal<RoomUser>();

  createEffect(() => {
    setOwner(
      state.chat.currentRoom?.users.find((user) => user.role === 'owner'),
    );
  });
  return (
    <>
      <div class="text-white">
        <h4 class="text-center p-2 bg-skin-menu-background">Admin</h4>
        <Show when={owner()}>
          <div class="p-2 flex items-center">
            <Avatar />
            <h1 class="pl-4">{owner()!.display_name}</h1>
          </div>
        </Show>
      </div>
      <div class="h-full text-white">
        <h4 class="text-center p-2 bg-skin-menu-background">Members</h4>
        <div class="flex items-center p-2 pl-6">
          <button onClick={() => setIsOpen(!isOpen())}>
            <AiOutlinePlusCircle class="block" size={26} />
          </button>
          <h4 class="pl-4">Add member</h4>
          <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
            <div class="p-2 bg-skin-header-background absolute right-7 border border-header-menu rounded-md shadow-md">
              <AddUserToRoom currentRoom={state.chat.currentRoom!} />
            </div>
          </Modal>
        </div>
        <Show
          when={state.chat.currentRoom && state.currentUser.userData && owner()}
        >
          <For
            each={state.chat.currentRoom!.users!.filter(
              (user) => user.id !== owner()?.id,
            )}
          >
            {(user) => <ChatRoomUserCard user={user} ownerId={owner()!.id} />}
          </For>
        </Show>
      </div>
    </>
  );
};

export default ChatRightSideBar;
