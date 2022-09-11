import {
  Component,
  createEffect,
  createMemo,
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
import { TAB, useStore } from '../store/StoreProvider';
import Avatar from './Avatar';
import ChatRoomUserCard from './ChatRoomUserCard';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { RoomInfo, WsNotificationEvent } from '../types/chat.interface';
import RoomSettings from './RoomSettings';
import Loader from './Loader';
import { IoSettingsOutline } from 'solid-icons/io';
import Scrollbars from 'solid-custom-scrollbars';
import { useSockets } from '../Providers/SocketProvider';
import { useAuth } from '../Providers/AuthProvider';
import { chatApi } from '../api/chat';
import { AxiosError } from 'axios';

const ChatRightSideBar: Component<{}> = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [state, { setCurrentRoomId, changeTab }] = useStore();
  const [auth] = useAuth();
  const roomId = () => state.chat.roomId;
  let addRef: any;
  const [sockets] = useSockets();
  const url = () => (roomId() ? `${routes.chat}/room_info/${roomId()}` : null);

  const [currentRoom, { refetch, mutate, forget }] =
    createTurboResource<RoomInfo>(() => url());
  const currentUserRole = createMemo(
    () => currentRoom()?.users.find((user) => user.id === auth.user.id)?.role,
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
        let res: { event: WsNotificationEvent; room?: RoomInfo };
        res = JSON.parse(e.data);
        if (res.event === 'chat_new_user_in_group') {
          mutate({ ...res.room! });
        } else if (res.event === 'chat: userLeave') {
          refetch();
        }
      });
    }
  });

  const [tab, setTab] = createSignal(0);

  const onLeaveGroup = () => {
    chatApi
      .leaveGroup(currentRoom()!.room_id)
      .then(() => {
        notifySuccess(
          `${auth.user.display_name} left ${currentRoom()!.room_name}`,
        );
        setCurrentRoomId(undefined);
        changeTab(TAB.HOME);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  onCleanup(() => {
    forget();
    if (sockets.notificationWs) {
      sockets.notificationWs.removeEventListener('message', () => {});
    }
  });
  return (
    <Show when={state.chat.roomId}>
      <div class="min-w-fit">
        <h4 class="p-2 text-start">Owner</h4>
        <Show when={owner()}>
          {(o) => (
            <div class="p-2 flex items-center border border-base-200 shadow-md">
              <Avatar
                color={
                  state.onlineUsers.includes(o.id)
                    ? 'bg-green-400'
                    : 'bg-red-400'
                }
                imgUrl={
                  o.avatarId ? `${generateImageUrl(o.avatarId)}` : undefined
                }
              />
              <div class="pl-3">
                <h1 class="font-semibold text-neutral-focus">
                  {o.display_name}
                </h1>
                <Show when={state.inGameUsers.includes(o.id)}>
                  <p class="text-info">in Game</p>
                </Show>
              </div>
            </div>
          )}
        </Show>
      </div>
      <ul class="flex items-center justify-between">
        <li onClick={() => setTab(0)} class="text-start p-2 btn btn-ghost">
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
              height: '100%',
            }}
          >
            <h1 class="p-2 font-semibold">Admin</h1>
            <Show when={admins()} fallback={<Loader />}>
              <For each={admins()}>
                {(user) => (
                  <ChatRoomUserCard user={user} ownerId={owner()!.id} />
                )}
              </For>
              <h1 class="p-2 font-semibold">Online</h1>
              <For each={onlineUsers()}>
                {(user) => (
                  <ChatRoomUserCard user={user} ownerId={owner()!.id} />
                )}
              </For>
              <h1 class="p-2 font-semibold">Offline</h1>
              <For
                each={currentRoom()!.users.filter(
                  (user) =>
                    !state.onlineUsers.includes(user.id) &&
                    user.id != owner()?.id,
                )}
              >
                {(user) => (
                  <ChatRoomUserCard user={user} ownerId={owner()!.id} />
                )}
              </For>
            </Show>
          </Scrollbars>
          <button onClick={onLeaveGroup} class="btn-error btn btn-sm w-fit">
            Leave channel
          </button>
        </Match>
        <Match when={tab() == 1}>
          <Show when={owner()}>{(o) => <RoomSettings owner={o} />}</Show>
        </Match>
      </Switch>
    </Show>
  );
};

export default ChatRightSideBar;
