import { useNavigate } from 'solid-app-router';
import { Component, createSignal, For, Show } from 'solid-js';
import UserCard from './UserCard';
import { AiOutlinePlusCircle } from 'solid-icons/ai';
import Modal from './Modal';
import AddUserToRoom from './admin/AddUserToRoom';
import { useStore } from '../store';
import Avatar from './Avatar';

const ChatRightSideBar: Component<{}> = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = createSignal(false);
  const [state] = useStore();
  return (
    <>
      <div class="text-white">
        <h4 class="text-center p-2 bg-skin-menu-background">Admin</h4>
        <Show when={state.currentUser.userData}>
          <div class="p-2">
            <Avatar />
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
            <div class="p-2 bg-skin-header-background absolute right-3 border rounded-md shadow-md">
              <AddUserToRoom currentRoom={state.chat.currentRoom!} />
            </div>
          </Modal>
        </div>
        <Show when={state.chat.currentRoom}>
          <For
            each={state.chat.currentRoom!.participants!.filter(
              (user) => user.id !== state.currentUser.userData?.id,
            )}
          >
            {(user) => (
              <div class="shadow-md">
                <UserCard
                  onClick={() => navigate(`/profile/${user.id}`)}
                  user={user}
                />
              </div>
            )}
          </For>
        </Show>
      </div>
    </>
  );
};

export default ChatRightSideBar;
