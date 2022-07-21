import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { useStore } from '../store';
import AddFriend from './AddFriend';
import Avatar from './Avatar';
import Search from './Search';

const FriendList: Component = () => {
  const [keyword, setKeyword] = createSignal('');
  const [state, { loadFriendMessages }] = useStore();

  return (
    <div>
      <Search
        setKeyword={setKeyword}
        popperMsg="Add friend"
        placeHolder="Search for a friend"
      >
        <AddFriend />
      </Search>
      <Show when={state.currentUser.friends}>
        <For each={state.currentUser.friends}>
          {(friend) => (
            <div
              onClick={() => {
                if (loadFriendMessages) {
                  loadFriendMessages(friend.id);
                }
              }}
              class="flex p-1 border shadow-md border-slate-800"
            >
              <Avatar />
              <h1 class="px-4">{friend.display_name}</h1>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};

export default FriendList;
