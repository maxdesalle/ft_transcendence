import { useNavigate } from 'solid-app-router';
import { Component, createSignal, For } from 'solid-js';
import { RoomInfoShort } from '../types/chat.interface';
import { User } from '../types/user.interface';
import UserCard from './UserCard';

import { AiOutlinePlusCircle } from 'solid-icons/ai';
import Modal from './Modal';
import AddUserToRoom from './admin/AddUserToRoom';
const ChatRightSideBar: Component<{
  user: User;
  currentRoom: RoomInfoShort;
}> = (props) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = createSignal(false);
  return (
    <>
      <div>
        <h4 class="text-center p-2 text-white bg-gray-700">Admin</h4>
        <UserCard user={props.user} />
      </div>
      <div class="h-full bg-gray-500">
        <h4 class="text-center p-2 bg-gray-700 text-white">Members</h4>

        <div class="flex items-center p-2 pl-6">
          <button onClick={() => setIsOpen(!isOpen())}>
            <AiOutlinePlusCircle class="block" size={26} />
          </button>
          <h4 class="pl-4">Add member</h4>
          <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
            <div class="p-2 bg-skin-header-background absolute right-3 border rounded-md shadow-md">
              <AddUserToRoom currentRoom={props.currentRoom} />
            </div>
          </Modal>
        </div>
        <For
          each={props.currentRoom.participants!.filter(
            (user) => user.id !== props.user.id,
          )}
        >
          {(user) => (
            <div class="p7 border-2 shadow-md">
              <UserCard
                bgColor="bg-indigo-500"
                onClick={() => navigate(`/profile/${user.id}`)}
                user={user}
              />
            </div>
          )}
        </For>
      </div>
    </>
  );
};

export default ChatRightSideBar;
