import { Component, createSignal, For, Match, Show, Switch } from 'solid-js';
import { HiSolidUserGroup } from 'solid-icons/hi';
import { useStore } from '../store';
import FriendList from './FriendList';
import Search from './Search';
import CreateRoom from './admin/createRoom';

const ChatSideBar: Component = () => {
  const [keyword, setKeyword] = createSignal('');

  const [state, { setCurrentRoom }] = useStore();
  const [tab, setTab] = createSignal(0);

  const updateTab = (index: number) => {
    setTab(index);
  };

  return (
    <>
      <ul class="flex text-white">
        <li
          onClick={() => updateTab(0)}
          class="p-2 hover:text-gray-400 transition-all"
        >
          Rooms
        </li>
        <li
          onClick={() => updateTab(1)}
          class="p-2 hover:text-gray-400 transition-all"
        >
          Friends
        </li>
      </ul>
      <Switch>
        <Match when={tab() == 0}>
          <Search
            setKeyword={setKeyword}
            placeHolder="Search for room"
            popperMsg="Create new room"
          >
            <CreateRoom />
          </Search>
          <div class="row-span-4 px-2 bg-skin-menu-background">
            <Show when={state.chat.rooms}>
              <For
                each={state.chat.rooms!.filter((room) =>
                  room.room_name
                    .toLocaleLowerCase()
                    .includes(keyword().toLocaleLowerCase()),
                )}
              >
                {(room) => (
                  <div
                    onClick={() => {
                      setCurrentRoom(room);
                    }}
                    class="flex p-2 items-center"
                  >
                    <HiSolidUserGroup color={'#000'} size={24} />
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
        <Match when={tab() == 1}>
          <FriendList />
        </Match>
      </Switch>
    </>
  );
};

export default ChatSideBar;
