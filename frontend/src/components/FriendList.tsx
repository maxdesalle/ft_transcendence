import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/StoreProvider';
import { WsNotificationEvent } from '../types/chat.interface';
import { Friend } from '../types/user.interface';
import AddFriend from './AddFriend';
import FriendCard from './FriendCard';
import Search from './Search';

const FriendList: Component = () => {
  const [keyword, setKeyword] = createSignal('');
  const [state, { setFriendId }] = useStore();
  const onLoadFriendMessages = (friend: Friend) => {
    setFriendId(friend.id);
  };
  const [sockets] = useSockets();
  const [friends, { refetch, mutate }] = createTurboResource<Friend[]>(
    () => routes.friends,
  );
  const filteredFriends = () =>
    friends()?.filter((user) => {
      return user.display_name.toLowerCase().includes(keyword().toLowerCase());
    });

  let ref: any;
  createEffect(() => {
    if (
      sockets.notificationWs &&
      sockets.notificationState === WebSocket.OPEN
    ) {
      sockets.notificationWs.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent; data: any; f: any };
        res = JSON.parse(e.data);
        if (res.event === 'friends: request_accepted') {
          refetch();
        }
      });
    }
  });

  return (
    <div ref={ref} class="flex flex-col gap-2 h-full">
      <Search
        class="hidden lg:block"
        setKeyword={setKeyword}
        popperMsg="Add friend"
        placeHolder="Search for a friend"
      >
        <AddFriend />
      </Search>
      <Show when={filteredFriends()}>
        <ul class="menu bg-base-100">
          <For each={filteredFriends()}>
            {(friend) => (
              <li class="w-full">
                <a
                  classList={{
                    active: state.chat.friendId === friend.id,
                  }}
                >
                  <FriendCard
                    onClick={() => onLoadFriendMessages(friend)}
                    friend={friend}
                  />
                </a>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
};

export default FriendList;
