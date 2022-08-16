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
import { TAB, useStore } from '../store';
import FriendList from './FriendList';
import Search from './Search';
import CreateRoom from './admin/createRoom';
import Scrollbars from 'solid-custom-scrollbars';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { RoomInfo, WsNotificationEvent } from '../types/chat.interface';
import RoomList from './RoomList';
import { useAuth } from '../Providers/AuthProvider';
import JoinableRoomList from './JoinableRoomList';

const ChatSideBar: Component = () => {
  const [keyword, setKeyword] = createSignal('');
  const [auth] = useAuth();
  const [state, { changeTab }] = useStore();
  const [publicRooms, { refetch: refetchPublicRooms }] = createTurboResource<
    RoomInfo[]
  >(() => routes.publicRooms);
  const [rooms, { refetch: refetchRooms }] = createTurboResource<RoomInfo[]>(
    () => routes.getRooms,
  );

  const joinableRooms = () =>
    publicRooms()?.filter((rooms) => {
      const b = rooms.users.find((user) => user.id === auth.user.id);
      if (b) return false;
      return true;
    });

  const myRooms = () =>
    rooms()?.filter((rooms) => {
      const b = rooms.users.find((user) => user.id === auth.user.id);
      if (b) return true;
      return false;
    });

  onMount(() => {
    // state.ws.addEventListener('message', (e) => {
    //   let res: { event: WsNotificationEvent };
    //   res = JSON.parse(e.data);
    //   if (res.event === 'chat_new_group') {
    //     console.log("res: ", res);
    //     refetchPublicRooms();
    //     refetchRooms();
    //   } else if (res.event === 'chat_new_user_in_group') {
    //     refetchPublicRooms();
    //     refetchRooms();
    //   }
    // });
  });

  return (
    <>
      <ul class="flex text-white items-center">
        <li
          onClick={() => changeTab(TAB.HOME)}
          class="p-2 hover:text-gray-400 transition-all"
        >
          Home
        </li>
        <li
          onClick={() => changeTab(TAB.ROOMS)}
          class="p-2 hover:text-gray-400 transition-all"
        >
          Rooms
        </li>
        <li
          onClick={() => changeTab(TAB.FRIENDS)}
          class="p-2 hover:text-gray-400 transition-all"
        >
          Friends
        </li>
      </ul>
      <Scrollbars id="room_users" class="h-full">
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
        </Switch>
      </Scrollbars>
    </>
  );
};

export default ChatSideBar;
