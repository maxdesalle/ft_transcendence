import {
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
} from 'solid-js';
import { AiOutlinePlusCircle } from 'solid-icons/ai';
import Modal from './Modal';
import AddUserToRoom from './admin/AddUserToRoom';
import { useStore } from '../store/all';
import Avatar from './Avatar';
import ChatRoomUserCard from './ChatRoomUserCard';
import { RoomUser, User } from '../types/user.interface';
import { generateImageUrl } from '../utils/helpers';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { RoomInfo, WsNotificationEvent } from '../types/chat.interface';
import { api } from '../utils/api';
import RoomSettings from './RoomSettings';
import Loader from './Loader';
import { IoSettingsOutline } from 'solid-icons/io';
import Scrollbars from 'solid-custom-scrollbars';
import { useSockets } from '../Providers/SocketProvider';

const ChatRightSideBar: Component<{}> = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [state] = useStore();
  const roomId = () => state.chat.roomId;
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  let addRef: any;
  const [sockets] = useSockets();
  const url = () => (roomId() ? `${routes.chat}/room_info/${roomId()}` : null);

  const [currentRoom, { refetch }] = createTurboResource<RoomInfo>(() => url());
  const currentUserRole = createMemo(
    () =>
      currentRoom()?.users.find((user) => user.id === currentUser()?.id)?.role,
  );

  const owner = () =>
    currentRoom()?.users.find((user) => user.role === 'owner');

  const admins = createMemo(() =>
    currentRoom()?.users.filter(
      (user) =>
        user.id !== owner()?.id &&
        user.role === 'admin' &&
        state.onlineUsers.includes(user.id),
    ),
  );

  const onlineUsers = () =>
    currentRoom()!.users.filter(
      (user) =>
        user.id !== owner()!.id &&
        user.role === 'participant' &&
        state.onlineUsers.includes(user.id),
    );

  createEffect(() => {
    if (sockets.notificationWs) {
      sockets.notificationWs.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent };
        res = JSON.parse(e.data);
        if (res.event === 'chat_new_user_in_group') {
          refetch();
        }
      });
    }
  });

  const [tab, setTab] = createSignal(0);

  onCleanup(() => {
    if (sockets.notificationWs) {
      sockets.notificationWs.removeEventListener('message', () => {});
    }
  });
  return (
    <Show when={state.chat.roomId}>
      <div class="text-white h-full">
        <h4 class="p-2 text-start">Owner</h4>
        <Show when={owner()}>
          <div class="p-2 flex items-center">
            <Avatar
              color={
                state.onlineUsers.includes(owner()!.id)
                  ? 'bg-green-400'
                  : 'bg-red-400'
              }
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
        <ul class="flex">
          <li onClick={() => setTab(0)} class="text-start p-2">
            Members
          </li>
          <Show when={currentUserRole() !== 'participant'}>
            <li onClick={() => setTab(1)} class="text-start p-2">
              <IoSettingsOutline size={24} color="#000000" />
            </li>
          </Show>
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
            <Scrollbars
              style={{
                height: '70vh',
              }}
            >
              <h1 class="p-2">Admin</h1>
              <Show when={admins()} fallback={<Loader />}>
                <For each={admins()}>
                  {(user) => (
                    <ChatRoomUserCard
                      refetch={refetch}
                      user={user}
                      ownerId={owner()!.id}
                    />
                  )}
                </For>
                <h1 class="p-2">online</h1>
                <For each={onlineUsers()}>
                  {(user) => (
                    <ChatRoomUserCard
                      refetch={refetch}
                      user={user}
                      ownerId={owner()!.id}
                    />
                  )}
                </For>
                <h1 class="p-2">offline</h1>
                <For
                  each={currentRoom()!.users.filter(
                    (user) =>
                      user.id !== owner()!.id &&
                      user.role === 'participant' &&
                      !state.onlineUsers.includes(user.id),
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
            </Scrollbars>
            <div class="w-full p-1">
              <button class="btn-secondary">Leave channel</button>
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
