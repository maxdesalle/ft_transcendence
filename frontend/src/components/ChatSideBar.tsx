import { Component, createSignal, For, Match, Show, Switch } from 'solid-js';
import { HiSolidUserGroup } from 'solid-icons/hi';
import { TAB, useStore } from '../store';
import FriendList from './FriendList';
import Search from './Search';
import CreateRoom from './admin/createRoom';

const ChatSideBar: Component = () => {
  const [keyword, setKeyword] = createSignal('');

  const [state, { setCurrentRoom, changeTab, toggleShowMessages }] = useStore();

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
      <Switch>
        <Match when={state.chatUi.tab == TAB.ROOMS}>
          <Search
            setKeyword={setKeyword}
            placeHolder="Search for room"
            popperMsg="Create new room"
          >
            <CreateRoom />
          </Search>
          <div class="row-span-4 px-2">
            <Show when={state.chat.rooms}>
              <For
                each={state.chat.rooms!.filter(
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
                      setCurrentRoom(room);
                      if (!state.chatUi.showMessages) {
                        toggleShowMessages();
                      }
                    }}
                    class="flex p-2 items-center"
                  >
                    <HiSolidUserGroup size={24} />
                    <div class="pl-2 text-white hover:text-slate-400 transition-all">
                      <p class="font-bold first-letter:capitalize">
                        {room.room_name}
                      </p>
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </Match>
        <Match when={state.chatUi.tab === TAB.FRIENDS}>
          <FriendList />
        </Match>
      </Switch>
    </>
  );
};

export default ChatSideBar;
