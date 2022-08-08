import { Component, createSignal, For, Match, Show, Switch } from 'solid-js';
import { HiSolidUserGroup } from 'solid-icons/hi';
import { TAB, useStore } from '../store';
import FriendList from './FriendList';
import Search from './Search';
import CreateRoom from './admin/createRoom';
import Scrollbars from 'solid-custom-scrollbars';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { RoomInfo } from '../types/chat.interface';

const ChatSideBar: Component = () => {
  const [keyword, setKeyword] = createSignal('');

  const [state, { setCurrentRoomId, changeTab, toggleShowMessages }] =
    useStore();
  const [rooms, { refetch }] = createTurboResource<RoomInfo[]>(
    () => routes.getRooms,
  );

  return (
    <>
      <ul class="flex text-white">
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
      <Scrollbars class="h-full">
        <Switch>
          <Match when={state.chatUi.tab == TAB.ROOMS}>
            <Search
              setKeyword={setKeyword}
              placeHolder="Search for room"
              popperMsg="Create new room"
            >
              <CreateRoom refetch={refetch} />
            </Search>
            <Show when={rooms()}>
              <For
                each={rooms()!.filter(
                  (room) =>
                    room.room_name
                      .toLocaleLowerCase()
                      .includes(keyword().toLocaleLowerCase()) &&
                    room.type === 'group',
                )}
              >
                {(room) => (
                  <div
                    onClick={() => {
                      setCurrentRoomId(room.room_id);
                      if (!state.chatUi.showMessages) {
                        toggleShowMessages();
                      }
                    }}
                    class="flex p-2 items-center"
                  >
                    <HiSolidUserGroup color="#2564eb" size={24} />
                    <div class="pl-2 text-white hover:text-slate-400 transition-all">
                      <p class="font-bold first-letter:capitalize">
                        {room.room_name}
                      </p>
                    </div>
                  </div>
                )}
              </For>
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
