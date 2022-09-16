import { Link, useNavigate } from 'solid-app-router';
import {
  Component,
  createEffect,
  createMemo,
  createSignal,
  Setter,
  Show,
} from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { blockUser, chatApi } from '../api/chat';
import { routes } from '../api/utils';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/StoreProvider';
import { WsNotificationEvent } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import Avatar from './Avatar';
import { AiFillSetting } from 'solid-icons/ai';
import { ImCross } from 'solid-icons/im';
const FriendSideBar: Component<{
  friend: User;
  setIsWatching: Setter<boolean>;
  mutate: Setter<User>;
}> = (props) => {
  const [sockets] = useSockets();
  const [state] = useStore();

  const [blockedFriends, { mutate, refetch }] = createTurboResource<number[]>(
    () => routes.blocked,
  );

  const onBlockFriend = () => {
    blockUser({ user_id: props.friend.id })
      .then((res) => {
        mutate([...res.data]);
        refetch();
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
  const navigate = useNavigate();
  const onWatch = () => {
    const id = state.usersSessionIds.find((v) => v.id === props.friend.id);
    if (id) {
      navigate(`/viewer/${id.sessionId}`);
    }
  };

  const [ref, setRef] = createSignal<HTMLElement>();
  const [btnRef, setBtnRef] = createSignal<HTMLElement>();
  const [btnHideRef, setBtnHideRef] = createSignal<HTMLElement>();
  createEffect(() => {
    if (
      sockets.notificationWs &&
      sockets.notificationState === WebSocket.OPEN
    ) {
      sockets.notificationWs.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent; data: any; friend: any };
        res = JSON.parse(e.data);
        if (res.event === 'chat: blocked') {
          refetch();
        }
      });
    }
  });

  const toggleSettings = () => {
    ref()?.classList.toggle('hidden');
    btnRef()?.classList.toggle('hidden');
    btnHideRef()?.classList.toggle('hidden');
  };

  return (
    <>
      <button
        ref={setBtnRef}
        onClick={toggleSettings}
        class="z-20 block md:hidden lg:hidden absolute btn-ghost btn btn-md right-0"
      >
        <AiFillSetting />
      </button>
      <button
        ref={setBtnHideRef}
        onClick={toggleSettings}
        class="z-20 lg:hidden hidden absolute btn-ghost btn btn-md right-0"
      >
        <ImCross />
      </button>
      <div
        ref={setRef}
        class="hidden md:flex md:static px-4 pb-3 border border-base-200 absolute top-0 right-0"
      >
        <div class="flex flex-col gap-2">
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
            <button onClick={onWatch} class="btn-primary btn btn-sm">
              Watch
            </button>
          </Show>
        </div>
      </div>
    </>
  );
};

export default FriendSideBar;
