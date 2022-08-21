import autoAnimate from '@formkit/auto-animate';
import Scrollbars from 'solid-custom-scrollbars';
import {
  Component,
  createEffect,
  createSignal,
  For,
  onMount,
  Show,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { useStore } from '../store/all';
import { Friend, User } from '../types/user.interface';
import AddFriend from './AddFriend';
import FriendCard from './FriendCard';
import Search from './Search';

const FriendList: Component = () => {
  const [keyword, setKeyword] = createSignal('');
  const [state, { setFriendId }] = useStore();
  const onLoadFriendMessages = (friend: Friend) => {
    setFriendId(friend.id);
  };
  const [friends] = createTurboResource<Friend[]>(() => routes.friends);
  const filteredFriends = () =>
    friends()?.filter((user) => {
      return user.display_name.toLowerCase().includes(keyword().toLowerCase());
    });

  let ref: any;

  return (
    <div ref={ref} class="h-full">
      <Search
        setKeyword={setKeyword}
        popperMsg="Add friend"
        placeHolder="Search for a friend"
      >
        <AddFriend />
      </Search>
      <Show when={filteredFriends()}>
        <For each={filteredFriends()}>
          {(friend) => (
            <div class="flex p-1 px-2 transition-all hover:scale-105 border shadow-md border-slate-800">
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
