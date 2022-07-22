import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { urls } from '../api/utils';
import { useStore } from '../store';
import AddFriend from './AddFriend';
import Avatar from './Avatar';
import Search from './Search';

const FriendList: Component = () => {
  const [keyword, setKeyword] = createSignal('');
  const [state, { loadFriendMessages, toggleShowMessages }] = useStore();

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
                  if (!state.chatUi.showMessages) {
                    toggleShowMessages();
                  }
                }
              }}
              class="flex p-1 border shadow-md border-slate-800"
            >
              <Avatar imgUrl={`${urls.backendUrl}/database-files/${friend.avatarId}`} />
              <h1 class="px-4">{friend.display_name}</h1>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};

export default FriendList;
