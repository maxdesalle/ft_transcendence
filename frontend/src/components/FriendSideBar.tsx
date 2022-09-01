import { Link } from 'solid-app-router';
import { Component, createEffect, createMemo, Setter, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { blockUser, chatApi } from '../api/chat';
import { routes } from '../api/utils';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/all';
import { User } from '../types/user.interface';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import Avatar from './Avatar';

const FriendSideBar: Component<{
  friend: User;
  setIsWatching: Setter<boolean>;
}> = (props) => {
  const [sockets] = useSockets();
  const [state] = useStore();

  const [blockedFriends, { mutate }] = createTurboResource<number[]>(
    () => routes.blocked,
  );

  const onBlockFriend = () => {
    blockUser({ user_id: props.friend.id })
      .then((res) => {
        mutate([...res.data]);
        notifySuccess(`${props.friend.display_name} blocked successfully`);
      })
      .catch(() => {
        notifyError(`${props.friend.display_name} cant be blocked`);
      });
  };

  const onUnblockFriend = () => {
    chatApi
      .unblockUser({ user_id: props.friend.id })
      .then((res) => {
        mutate([...res.data]);
        notifySuccess(`${props.friend.display_name} unblocked successfully`);
      })
      .catch(() => {
        notifyError(`${props.friend.display_name} cant be unblocked`);
      });
  };

  const inviteFriend = () => {
    if (!state.onlineUsers.includes(props.friend.id)) {
      notifyError(`${props.friend.display_name} is offline`);
      return;
    }
    const data = { event: 'invite', data: props.friend.id };
    sockets.pongWs!.send(JSON.stringify(data));
  };

  const isBlocked = createMemo(() =>
    blockedFriends()?.includes(props.friend.id as number),
  );

  const inGame = createMemo(() => state.inGameUsers.includes(props.friend.id));

  return (
    <div class="flex flex-col px-2 gap-1">
      <Avatar
        class="pt-5 self-center"
        imgUrl={
          props.friend.avatarId
            ? generateImageUrl(props.friend.avatarId)
            : undefined
        }
      />
      <p class="self-center text-lg font-semibold pb-3">
        {props.friend.display_name}
      </p>
      <button
        onClick={inviteFriend}
        type="button"
        class="btn-primary w-full btn btn-sm"
      >
        Invite to play
      </button>
      <Link
        class="btn-primary w-full btn btn-sm"
        href={`/profile/${props.friend.id}`}
      >
        Profile
      </Link>
      <Show when={isBlocked() === false}>
        <button
          onClick={onBlockFriend}
          type="button"
          class="btn-error w-full btn btn-sm"
        >
          Block
        </button>
      </Show>
      <Show when={isBlocked()}>
        <button
          onClick={onUnblockFriend}
          type="button"
          class="btn btn-accent w-full"
        >
          Unblock
        </button>
      </Show>
      <Show when={inGame()}>
        <button class="btn-primary">Watch</button>
      </Show>
    </div>
  );
};

export default FriendSideBar;
