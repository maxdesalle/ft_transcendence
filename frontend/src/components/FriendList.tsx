import { Component, createSignal, For, Show } from 'solid-js';
import { useStore } from '../store';
import { User } from '../types/user.interface';
import AddFriend from './AddFriend';
import FriendCard from './FriendCard';
import Search from './Search';

const FriendList: Component = () => {
  const [keyword, setKeyword] = createSignal('');
  const [state, { loadFriendMessages, toggleShowMessages }] = useStore();
  const onLoadFriendMessages = (friend: User) => {
    if (loadFriendMessages) {
      loadFriendMessages(friend.id);
      if (!state.chatUi.showMessages) {
        toggleShowMessages();
      }
    }
  };

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
            <div class="flex p-1 border shadow-md border-slate-800">
              <FriendCard
                onClick={() => onLoadFriendMessages(friend)}
                friend={friend}
              />
            </div>
          )}
        </For>
      </Show>
    </div>
  );
};

export default FriendList;
