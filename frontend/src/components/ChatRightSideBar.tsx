import {
  Component,
  createEffect,
  createResource,
  createSignal,
  For,
  Show,
} from 'solid-js';
import { AiOutlinePlusCircle } from 'solid-icons/ai';
import Modal from './Modal';
import AddUserToRoom from './admin/AddUserToRoom';
import { useStore } from '../store';
import Avatar from './Avatar';
import ChatRoomUserCard from './ChatRoomUserCard';
import { RoomUser, User } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { RoomInfo } from '../types/chat.interface';
import { api } from '../utils/api';

const ChatRightSideBar: Component<{}> = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [state] = useStore();
  const [owner, setOwner] = createSignal<RoomUser>();
  const roomId = () => state.chat.roomId;
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const [currentRoom, { refetch }] = createResource(
    roomId,
    async (id: number) => {
      const res = await api.get<RoomInfo>(`${routes.chat}/room_info/${id}`);
      return res.data;
    },
  );
  const currentUserRole = () =>
    currentRoom()?.users.find((user) => user.id === currentUser()?.id)?.role;
  createEffect(() => {
    setOwner(currentRoom()?.users.find((user) => user.role === 'owner'));
  });

  return (
    <>
      <div class="text-white">
        <h4 class="text-center p-2 bg-skin-menu-background">Owner</h4>
        <Show when={owner()}>
          <div class="p-2 flex items-center">
            <Avatar
              imgUrl={
                owner()?.avatarId
                  ? `${generateImageUrl(owner()!.avatarId)}`
                  : undefined
              }
            />
            <h1 class="pl-4">{owner()!.display_name}</h1>
          </div>
        </Show>
      </div>
      <div class="h-full text-white">
        <h4 class="text-center p-2 bg-skin-menu-background">Members</h4>
        <div class="flex items-center p-2 pl-6">
          <Show when={currentUserRole() === 'owner'}>
            <button onClick={() => setIsOpen(!isOpen())}>
              <AiOutlinePlusCircle class="block" size={26} />
            </button>
            <h4 class="pl-4">Add member</h4>
            <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
              <div class="p-2 bg-skin-header-background absolute right-7 border border-header-menu rounded-md shadow-md">
                <AddUserToRoom currentRoom={currentRoom()!} refetch={refetch} />
              </div>
            </Modal>
          </Show>
        </div>
        <Show when={currentRoom() && owner() && currentUser()}>
          <For
            each={currentRoom()?.users.filter(
              (user) => user.id !== currentUser()!.id,
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
