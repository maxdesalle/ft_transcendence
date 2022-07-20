import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { unwrap } from 'solid-js/store';
import { useStore } from '../store';
import AddFriend from './AddFriend';
import Search from './Search';

const FriendList: Component = () => {
  const [keyword, setKeyword] = createSignal('');
  const [state] = useStore();

  createEffect(() => {
    console.log(unwrap(state));
  });
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
            <div>
              <h1>{friend.display_name}</h1>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};

export default FriendList;
