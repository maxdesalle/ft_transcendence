import {
  Component,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { RoomUser } from '../types/user.interface';
import Modal from './Modal';
import { TAB, useStore } from '../store/all';
import { Link } from 'solid-app-router';
import Avatar from './Avatar';
import { blockUser, chatApi } from '../api/chat';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import toast from 'solid-toast';
import { RoomInfo, WsNotificationEvent } from '../types/chat.interface';
import { generateImageUrl, notifyError, notifySuccess } from '../utils/helpers';
import { AxiosError } from 'axios';
import autoAnimate from '@formkit/auto-animate';
import { sendFriendReq } from '../api/user';
import { useSockets } from '../Providers/SocketProvider';
import { useAuth } from '../Providers/AuthProvider';

const ChatRoomUserCard: Component<{
  user: RoomUser;
  ownerId: number;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [state, { changeTab, setFriendId, setCurrentRoomId }] = useStore();
  let ref: any;
  const [sockets] = useSockets();

  const path = state.chat.roomId
    ? `${routes.chat}/room_info/${state.chat.roomId}`
    : null;
  const [currentRoom, { mutate: mutateCurrentRoom }] =
    createTurboResource<RoomInfo>(() => path);
  const [auth] = useAuth();
  const [friends] = createTurboResource<number[]>(() => `${routes.friends}/id`);
  const [blockedUsers, { mutate }] = createTurboResource<number[]>(
    () => routes.blocked,
  );
  const notify = (msg: string) => toast.success(msg);
  const inviteUser = () => {
    const data = { event: 'invite', data: props.user.id };
    sockets.pongWs!.send(JSON.stringify(data));
    notify(`invitation sent to ${props.user.display_name}`);
  };

  const currentUserRole = () =>
    currentRoom()?.users.find((user) => user.id === auth.user.id)?.role;

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
    if (currentRoom()) {
      chatApi
        .muteUser({
          room_id: currentRoom()!.room_id,
          user_id: props.user.id,
          time_minutes: 5,
        })
        .then((res) => {
          notifySuccess(
            `${props.user.display_name} muted from ${currentRoom()!.room_name}`,
          );
          mutateCurrentRoom({ ...res.data });
        })
        .catch((e: AxiosError<{ message: string }>) => {
          notifyError(e.response?.data.message as string);
        });
    }
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
        room_id: currentRoom()!.room_id,
        user_id: props.user.id,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} unmuted from ${currentRoom()!.room_name}`,
        );
        mutateCurrentRoom({ ...res.data });
      });
  };

  const onBanUser = () => {
    chatApi
      .banUser({
        room_id: currentRoom()!.room_id,
        user_id: props.user.id,
        time_minutes: 5,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} banned from ${currentRoom()!.room_name}`,
        );
        mutateCurrentRoom({ ...res.data });
      })
      .catch((e: AxiosError<{ message: string }>) => {
        notifyError(e.response?.data.message as string);
      });
  };

  const onUnbanUser = () => {
    chatApi
      .unbanUser({
        room_id: currentRoom()!.room_id,
        user_id: props.user.id,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} unbanned from ${
            currentRoom()!.room_name
          }`,
        );
        mutateCurrentRoom({ ...res.data });
      })
      .catch((e: AxiosError<{ message: string }>) => {
        notifyError(e.response?.data.message as string);
      });
  };

  const onPromoteUser = () => {
    chatApi
      .promoteUser({
        room_id: currentRoom()!.room_id,
        user_id: props.user.id,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} promoted as admin: ${
            currentRoom()!.room_name
          }`,
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
        room_id: currentRoom()!.room_id,
        user_id: props.user.id,
      })
      .then((res) => {
        notifySuccess(
          `${props.user.display_name} demoted to participant: ${
            currentRoom()!.room_name
          }`,
        );
        mutateCurrentRoom({ ...res.data });
      })
      .catch((e: AxiosError<{ message: string }>) => {
        notifyError(e.response?.data.message as string);
      });
  };

  onMount(() => {
    autoAnimate(ref);
    if (sockets.notifWsState === WebSocket.OPEN) {
      sockets.notificationWs!.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent; data: any; room: RoomInfo };
        res = JSON.parse(e.data);
        switch (res.event) {
          case 'chat: banned':
            mutateCurrentRoom({ ...res.room! });
            break;
          case 'chat: demoted':
            mutateCurrentRoom({ ...res.room! });
            break;
          case 'chat: unbanned':
            mutateCurrentRoom({ ...res.room! });
            break;
          case 'chat: promoted':
            mutateCurrentRoom({ ...res.room! });
            break;
          case 'chat: muted':
            mutateCurrentRoom({ ...res.room! });
            break;
          case 'chat: unmuted':
            mutateCurrentRoom({ ...res.room! });
            break;
          case 'chat: youGotBanned':
            notifySuccess(
              `${auth.user.display_name} got banned from ${res.data.room_name}`,
            );
            setCurrentRoomId(undefined);
            changeTab(TAB.HOME);
            break;
          default:
            break;
        }
      });
    }
  });

  onCleanup(() => {
    if (sockets.notifWsState === WebSocket.OPEN) {
      sockets.notificationWs?.removeEventListener('message', () => {});
    }
  });

  const isOnline = createMemo(() => state.onlineUsers.includes(props.user.id));
  const isInGame = createMemo(() => state.inGameUsers.includes(props.user.id));
  const isBlocked = () => blockedUsers()?.includes(props.user.id);
  const isFriend = () => friends()?.includes(props.user.id);

  return (
    <div ref={ref} class="w-full rounded-lg shadow-md">
      <div
        class={`flex items-center hover:bg-gray-900 justify-between transition-all px-1 py-2`}
      >
        <div
          classList={{ 'animate-pulse': isInGame() }}
          onClick={() => setIsOpen(true)}
          class="flex w-full md:pl-0 pl-4"
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
            <h1 class="hidden md:block">{props.user.display_name}</h1>
            <Show when={state.inGameUsers.length}>
              <p class="text-sm text-cyan-700">{isInGame() ? 'In Game' : ''}</p>
            </Show>
          </div>
        </div>
      </div>
      <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
        <div class="flex flex-col p-3 w-40 border absolute shadow-md rounded-md bg-skin-page border-header-menu -top-6 right-1">
          <Link
            class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
            href={`/profile/${props.user.id}`}
          >
            Profile
          </Link>
          <button
            onClick={inviteUser}
            class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
          >
            Send invite
          </button>
          <Show
            when={isBlocked()}
            fallback={
              <button
                onClick={onBlockUser}
                class="text-start hover:bg-red-700 px-3 rounded-sm transition-all"
              >
                Block
              </button>
            }
          >
            <button
              onClick={onUnblockUser}
              class="text-start hover:bg-red-700 px-3 rounded-sm transition-all"
            >
              Unblock
            </button>
          </Show>
          <Show
            when={isFriend()}
            fallback={
              <button
                onClick={onSendFriendReq}
                class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
              >
                Add friend
              </button>
            }
          >
            <button
              onClick={() => {
                changeTab(TAB.FRIENDS);
                setFriendId(props.user.id);
              }}
              class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
            >
              Send message
            </button>
          </Show>

          <Show
            when={
              currentUserRole() === 'admin' || currentUserRole() === 'owner'
            }
          >
            <button
              onClick={onMuteUser}
              class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
            >
              Mute
            </button>
            <button
              onClick={onUnmuteUser}
              class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
            >
              Unmute
            </button>
            <button
              onClick={onBanUser}
              class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
            >
              Ban
            </button>
            <button
              onClick={onUnbanUser}
              class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
            >
              Unban
            </button>
            <button
              onClick={onPromoteUser}
              class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
            >
              Promote
            </button>
            <button
              onClick={onDemoteUser}
              class="text-start hover:bg-blue-600 px-3 rounded-sm transition-all"
            >
              Demote
            </button>
          </Show>
        </div>
      </Modal>
    </div>
  );
};

export default ChatRoomUserCard;
