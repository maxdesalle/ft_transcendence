import {
  Component,
  createEffect,
  createResource,
  createSignal,
  onMount,
  Show,
  Suspense,
} from 'solid-js';
import { RoomUser } from '../types/user.interface';
import { AiOutlineMore } from 'solid-icons/ai';
import Modal from './Modal';
import { TAB, useStore } from '../store';
import { Link } from 'solid-app-router';
import Avatar from './Avatar';
import { chatApi } from '../api/chat';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { User } from '../types/user.interface';
import toast from 'solid-toast';
import { RoomInfo } from '../types/chat.interface';
import { api } from '../utils/api';
import { notifyError, notifySuccess } from '../utils/helpers';
import { AxiosError } from 'axios';
import autoAnimate from '@formkit/auto-animate';
import { sendFriendReq } from '../api/user';

const ChatRoomUserCard: Component<{
  user: RoomUser;
  ownerId: number;
  refetch: () => void;
}> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [state, { changeTab, setFriendId }] = useStore();
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);
  const roomId = () => state.chat.roomId;
  let ref: any;
  const [currentRoom] = createResource(roomId, async (id: number) => {
    const res = await api.get<RoomInfo>(`${routes.chat}/room_info/${id}`);
    return res.data;
  });
  const [friends] = createTurboResource<number[]>(() => `${routes.friends}/id`);
  const notify = (msg: string) => toast.success(msg);
  const [isFriend, setIsFriend] = createSignal(false);
  const inviteUser = () => {
    const data = { event: 'invite', data: props.user.id };
    state.pong.ws.send(JSON.stringify(data));
    notify(`invitation sent to ${props.user.display_name}`);
  };

  const currentUserRole = () =>
    currentRoom()?.users.find((user) => user.id === currentUser()?.id)?.role;

  const onMuteUser = () => {
    if (currentRoom()) {
      chatApi
        .muteUser({
          room_id: currentRoom()!.room_id,
          user_id: props.user.id,
          time_minutes: 5,
        })
        .then(() => {
          notifySuccess(
            `${props.user.display_name} muted from ${currentRoom()!.room_name}`,
          );
          props.refetch();
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
      .then(() => {
        notifySuccess(
          `${props.user.display_name} unmuted from ${currentRoom()!.room_name}`,
        );
        props.refetch();
      });
  };

  const onBanUser = () => {
    chatApi
      .banUser({
        room_id: currentRoom()!.room_id,
        user_id: props.user.id,
        time_minutes: 5,
      })
      .then(() => {
        notifySuccess(
          `${props.user.display_name} banned from ${currentRoom()!.room_name}`,
        );
        props.refetch();
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
      .then(() => {
        notifySuccess(
          `${props.user.display_name} unbanned from ${
            currentRoom()!.room_name
          }`,
        );
        props.refetch();
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
      .then(() => {
        notifySuccess(
          `${props.user.display_name} promoted as admin: ${
            currentRoom()!.room_name
          }`,
        );
        props.refetch();
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
      .then(() => {
        notifySuccess(
          `${props.user.display_name} demoted to participant: ${
            currentRoom()!.room_name
          }`,
        );
        props.refetch();
      })
      .catch((e: AxiosError<{ message: string }>) => {
        notifyError(e.response?.data.message as string);
      });
  };

  onMount(() => {
    autoAnimate(ref);
  });

  createEffect(() => {
    if (friends()) {
      setIsFriend(friends()!.includes(props.user.id));
    }
  });

  return (
    <div ref={ref} class="w-5/6 rounded-lg shadow-md">
      <div
        class={
          props.user.role === 'admin'
            ? 'bg-pink-700 hover:bg-pink-900 flex items-center justify-between transition-all p-3'
            : `flex items-center hover:bg-gray-900 justify-between transition-all p-3`
        }
      >
        <div onClick={() => setIsOpen(true)} class="flex items-center">
          <Avatar />
          <h1 class="pl-3">{props.user.display_name}</h1>
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
            when={isFriend() === true}
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
