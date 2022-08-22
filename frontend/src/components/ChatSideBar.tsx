import {
  Component,
  createEffect,
  createSignal,
  For,
  Match,
  onMount,
  Show,
  Switch,
} from 'solid-js';
import { HiSolidUserGroup } from 'solid-icons/hi';
import { TAB, useStore } from '../store/all';
import FriendList from './FriendList';
import Search from './Search';
import CreateRoom from './admin/createRoom';
import Scrollbars from 'solid-custom-scrollbars';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { RoomInfo, WsNotificationEvent } from '../types/chat.interface';
import RoomList from './RoomList';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';

const ChatSideBar: Component = () => {
  const [keyword, setKeyword] = createSignal('');
  const [auth] = useAuth();
  const [state, { changeTab }] = useStore();
  const [sockets] = useSockets();
  const [publicRooms, { refetch: refetchPublicRooms }] = createTurboResource<
    RoomInfo[]
  >(() => routes.publicRooms);
  const [rooms, { refetch: refetchRooms }] = createTurboResource<RoomInfo[]>(
    () => routes.getRooms,
  );

  const myRooms = () =>
    rooms()?.filter((rooms) => {
      const b = rooms.users.find((user) => user.id === auth.user.id);
      if (b) return true;
      return false;
    });

  createEffect(() => {
    if (sockets.notificationWs) {
      sockets.notificationWs.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent };
        res = JSON.parse(e.data);
        if (res.event === 'chat_new_group') {
          refetchPublicRooms();
          refetchRooms();
        } else if (res.event === 'chat_new_user_in_group') {
          refetchPublicRooms();
          refetchRooms();
        }
      });
    }
  });

  return (
    <>
      <ul class="text-white text-start flex-col">
        <li
          onClick={() => changeTab(TAB.HOME)}
          class="btn-primary text-start hover:text-gray-400 transition-all"
        >
          Pulbic Channels
        </li>
        <li
          onClick={() => changeTab(TAB.ROOMS)}
          class="btn-primary text-start hover:text-gray-400 transition-all"
        >
          Rooms
        </li>
        <li
          onClick={() => changeTab(TAB.FRIENDS)}
          class="btn-primary text-start hover:text-gray-400 transition-all"
        >
          Friends
        </li>
      </ul>
      <div id="room_users" class="h-full">
        <Switch>
          <Match when={state.chatUi.tab === TAB.ROOMS}>
            <Search
              setKeyword={setKeyword}
              placeHolder="Search for room"
              popperMsg="Create new room"
            >
              <CreateRoom refetch={refetchPublicRooms} />
            </Search>
            <Show when={publicRooms()}>
              <RoomList room={myRooms()!} keyword={keyword()} />
            </Show>
          </Match>
          <Match when={state.chatUi.tab === TAB.FRIENDS}>
            <FriendList />
          </Match>
          <Match when={state.chatUi.tab === TAB.HOME}>
            <p class="text-white p-2">Create room</p>
            <CreateRoom class="px-2" refetch={refetchPublicRooms} />
          </Match>
        </Switch>
      </div>
    </>
  );
};

export default ChatSideBar;
