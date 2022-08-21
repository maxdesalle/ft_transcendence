import {
  Component,
  createEffect,
  createResource,
  createSignal,
  For,
  Match,
  onMount,
  Show,
  Switch,
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
import RoomSettings from './RoomSettings';

const ChatRightSideBar: Component<{}> = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [state] = useStore();
  const [owner, setOwner] = createSignal<RoomUser>();
  const roomId = () => state.chat.roomId;
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  let addRef: any;
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

  const [tab, setTab] = createSignal(0);

  return (
    <Show when={state.chat.roomId}>
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
      <div class="text-white">
        <ul class="lg:flex bg-skin-menu-background">
          <li onClick={() => setTab(0)} class="text-center p-2">
            Members
          </li>
          <li onClick={() => setTab(1)} class="text-center p-2">
            Settings
          </li>
        </ul>
        <Switch>
          <Match when={tab() == 0}>
            <div ref={addRef} class="flex items-center py-2 pl-5">
              <Show when={currentUserRole() === 'owner'}>
                <button onClick={() => setIsOpen(!isOpen())}>
                  <AiOutlinePlusCircle class="block" size={26} />
                </button>
                <h4 class="pl-2">Add member</h4>
                <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
                  <div class="p-2 bg-skin-header-background absolute right-7 border border-header-menu rounded-md shadow-md">
                    <AddUserToRoom
                      currentRoom={currentRoom()!}
                      refetch={refetch}
                    />
                  </div>
                </Modal>
              </Show>
            </div>
            <div class="h-full flex flex-col items-center">
              <Show when={currentRoom() && owner() && currentUser()}>
                <For
                  each={currentRoom()?.users.filter(
                    (user) => user.id !== owner()!.id,
                  )}
                >
                  {(user) => (
                    <ChatRoomUserCard
                      refetch={refetch}
                      user={user}
                      ownerId={owner()!.id}
                    />
                  )}
                </For>
              </Show>
            </div>
          </Match>
          <Match when={tab() == 1}>
            <RoomSettings refetch={refetch} />
          </Match>
        </Switch>
      </div>
    </Show>
  );
};

export default ChatRightSideBar;
