import { Component, createMemo, createSignal, onCleanup, Show } from 'solid-js';
import { RoomUser } from '../types/user.interface';
import Modal from './Modal';
import { TAB, useStore } from '../store/StoreProvider';
import { Link, useNavigate } from 'solid-app-router';
import Avatar from './Avatar';
import { blockUser, chatApi } from '../api/chat';
import { createTurboResource, TurboMutateValue } from 'turbo-solid';
import { routes } from '../api/utils';
import toast from 'solid-toast';
import { RoomInfo, WsNotificationEvent } from '../types/chat.interface';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import { AxiosError } from 'axios';
import autoAnimate from '@formkit/auto-animate';
import { sendFriendReq } from '../api/user';
import { useSockets } from '../Providers/SocketProvider';
import { useAuth } from '../Providers/AuthProvider';
import Custom from './Custom';

const ChatRoomUserCard: Component<{
  user: RoomUser;
  ownerId: number;
  room: RoomInfo;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [banTime, setBanTime] = createSignal(0);
  const [state, { changeTab, setFriendId }] = useStore();
  let ref: any;
  const [sockets] = useSockets();
  const roomId = () => state.chat.roomId;

  const url = () => (roomId() ? `${routes.chat}/room_info/${roomId()}` : null);

  const [, { mutate: mutateCurrentRoom }] = createTurboResource<RoomInfo>(() =>
    url(),
  );

  const [auth] = useAuth();
  const [friends] = createTurboResource<number[]>(() => `${routes.friends}/id`);
  const [blockedUsers, { mutate }] = createTurboResource<number[]>(
    () => routes.blocked,
  );
  const bannedUserUrl = () =>
    state.chat.roomId ? `${routes.bannedUsers}/${state.chat.roomId}` : null;

  const [, { refetch }] = createTurboResource<
    { id: number; login42: string; display_name: string; unban: Date }[]
  >(() => bannedUserUrl());

  const inviteUser = () => {
    if (!state.onlineUsers.includes(props.user.id)) {
      notifyError(`${props.user.display_name} is offline`);
      return;
    }
    const data = { event: 'invite', data: props.user.id };
    sockets.pongWs!.send(JSON.stringify(data));
    notifySuccess(`invitation sent to ${props.user.display_name}`);
  };

  const navigate = useNavigate();

  const onWatch = () => {
    const id = state.usersSessionIds.find((v) => v.id === props.user.id);
    if (id) {
      navigate(`/viewer/${id.sessionId}`);
    }
  };

  const currentUserRole = () =>
    props.room.users.find((user) => user.id === auth.user.id)?.role;

  const onBlockUser = () => {
    blockUser({ user_id: props.user.id })
      .then((res) => {
        notifySuccess(`${props.user.display_name}: blocked`);
        mutate([...res.data]);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  const onUnblockUser = () => {
    chatApi
      .unblockUser({ user_id: props.user.id })
      .then((res) => {
        mutate([...res.data]);
        notifySuccess(`${props.user.display_name}: unblocked`);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  const onMuteUser = () => {
    chatApi
      .muteUser({
        room_id: props.room.room_id,
        user_id: props.user.id,
        time_minutes: 5,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} muted from ${props.room.room_name}`,
        );
        mutateCurrentRoom({ ...res.data });
      })
      .catch((e: AxiosError<{ message: string }>) => {
        notifyError(e.response?.data.message as string);
      });
  };

  const onSendFriendReq = () => {
    sendFriendReq(props.user.id)
      .then(() => {
        notifySuccess(`friend request sent to ${props.user.display_name}`);
      })
      .catch((err: AxiosError<{ message: string }>) => {
        notifyError(err.response?.data.message as string);
      });
  };

  const onUnmuteUser = () => {
    chatApi
      .unmuteUser({
        room_id: props.room.room_id,
        user_id: props.user.id,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} unmuted from ${props.room.room_name}`,
        );
        mutateCurrentRoom({ ...res.data });
      });
  };

  const onBanUser = () => {
    chatApi
      .banUser({
        room_id: props.room.room_id,
        user_id: props.user.id,
        time_minutes: banTime(),
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} banned from ${props.room.room_name}`,
        );
        refetch();
        mutateCurrentRoom({ ...res.data });
      })
      .catch((e: AxiosError<{ message: string }>) => {
        notifyError(e.response?.data.message as string);
      });
  };

  const onPromoteUser = () => {
    chatApi
      .promoteUser({
        room_id: props.room.room_id,
        user_id: props.user.id,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} promoted as admin: ${props.room.room_name}`,
        );
        mutateCurrentRoom({ ...res.data });
      })
      .catch((e: AxiosError<{ message: string }>) => {
        notifyError(e.response?.data.message as string);
      });
  };

  const onDemoteUser = () => {
    chatApi
      .demoteUser({
        room_id: props.room.room_id,
        user_id: props.user.id,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} demoted to participant: ${props.room.room_name}`,
        );
        mutateCurrentRoom({ ...res.data });
      })
      .catch((e: AxiosError<{ message: string }>) => {
        notifyError(e.response?.data.message as string);
      });
  };

  const onKickUser = () => {
    if (props.room) {
      chatApi
        .kickUser({ user_id: props.user.id, room_id: props.room.room_id })
        .then((res) => {
          mutateCurrentRoom({ ...res.data });
          notifySuccess(
            `${props.user.display_name} got kicked from ${props.room.room_name}`,
          );
        })
        .catch((err: AxiosError<{ message: string }>) => {
          notifyError(err.response?.data.message as string);
        });
    }
  };

  onCleanup(() => {
    if (sockets.notificationState === WebSocket.OPEN) {
      sockets.notificationWs?.removeEventListener('message', () => {});
    }
  });

  const isOnline = createMemo(() => state.onlineUsers.includes(props.user.id));
  const isInGame = createMemo(() => state.inGameUsers.includes(props.user.id));
  const isBlocked = () => blockedUsers()?.includes(props.user.id);
  const isFriend = () => friends()?.includes(props.user.id);

  return (
    <div ref={ref} class="w-full shadow-md relative">
      <div
        class={`flex items-center mx-auto hover:bg-base-300 justify-between transition-all px-1 py-2`}
      >
        <div
          classList={{ 'animate-pulse': isInGame() }}
          onClick={() => setIsOpen(true)}
          class="flex w-full items-center"
        >
          <Avatar
            color={isOnline() ? 'bg-green-400' : 'bg-red-400'}
            imgUrl={
              props.user.avatarId
                ? generateImageUrl(props.user.avatarId)
                : undefined
            }
          />
          <div class="flex pl-3 flex-col w-full">
            <h1 class="hidden lg:block font-medium">
              {props.user.display_name}
            </h1>
            <Show when={isOnline() && !isInGame()}>
              <p class="text-green-600 hidden lg:block">online</p>
            </Show>
            <Show when={state.inGameUsers.length}>
              <p class="text-sm hidden lg:block text-cyan-700">
                {isInGame() ? 'In Game' : ''}
              </p>
            </Show>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
        <div class="menu menu-compact border rounded border-base-300 bg-base-300 right-1 -top-10 absolute w-32">
          <Show when={isInGame()}>
            <li>
              <button onClick={onWatch}>Watch</button>
            </li>
          </Show>
          <li>
            <Link href={`/profile/${props.user.id}`}>Profile</Link>
          </li>
          <li>
            <button onClick={inviteUser}>Send invite</button>
          </li>
          <Show
            when={isBlocked()}
            fallback={
              <li>
                <button onClick={onBlockUser}>Block</button>
              </li>
            }
          >
            <li>
              <button onClick={onUnblockUser}>Unblock</button>
            </li>
          </Show>
          <Show
            when={isFriend()}
            fallback={
              <li>
                <button onClick={onSendFriendReq}>Add friend</button>
              </li>
            }
          >
            <li>
              <button
                onClick={() => {
                  changeTab(TAB.FRIENDS);
                  setFriendId(props.user.id);
                }}
              >
                Send message
              </button>
            </li>
          </Show>

          <Show
            when={
              currentUserRole() === 'admin' || currentUserRole() === 'owner'
            }
          >
            <li>
              <button onClick={onMuteUser}>Mute</button>
            </li>
            <li>
              <button onClick={onUnmuteUser}>Unmute</button>
            </li>
            <li>
              <Custom setBanTime={setBanTime} onClick={onBanUser} />
            </li>
            <li>
              <button onClick={onKickUser}>Kick</button>
            </li>
            <li>
              <button onClick={onPromoteUser}>Promote</button>
            </li>
            <li>
              <button onClick={onDemoteUser}>Demote</button>
            </li>
          </Show>
        </div>
      </Modal>
    </div>
  );
};

export default ChatRoomUserCard;
