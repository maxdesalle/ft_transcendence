import {
  Component,
  createEffect,
  createSignal,
  Show,
  Suspense,
} from 'solid-js';
import { RoomUser } from '../types/user.interface';
import { AiOutlineMore } from 'solid-icons/ai';
import Modal from './Modal';
import { useStore } from '../store';
import { Link } from 'solid-app-router';
import Avatar from './Avatar';
import { chatApi } from '../api/chat';
import { createTurboResource } from 'turbo-solid';
import { routes } from '../api/utils';
import { User } from '../types/user.interface';
import toast, { Toaster } from 'solid-toast';

const ChatRoomUserCard: Component<{ user: RoomUser; ownerId: number }> = (
  props,
) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [state] = useStore();
  const [currentUser] = createTurboResource<User>(() => routes.currentUser);

  const notify = (msg: string) => toast.success(msg);
  const inviteUser = () => {
    const data = { event: 'invite', data: props.user.id };
    state.pong.ws.send(JSON.stringify(data));
    notify(`invitation sent to ${props.user.display_name}`);
  };

  const currentUserRole = () =>
    state.chat.currentRoom?.users.find((user) => user.id === currentUser()?.id)
      ?.role;

  const onMuteUser = () => {
    if (state.chat.currentRoom) {
      chatApi.muteUser({
        room_id: state.chat.currentRoom.room_id,
        user_id: props.user.id,
        time_minutes: 5,
      });
    }
    notify('user muted');
  };

  const onUnmuteUser = () => {
    chatApi.unmuteUser({
      room_id: state.chat.currentRoom!.room_id,
      user_id: props.user.id,
    });
  };

  const onBanUser = () => {
    chatApi.banUser({
      room_id: state.chat.currentRoom!.room_id,
      user_id: props.user.id,
      time_minutes: 5,
    });
    notify('user banned');
  };

  const onUnbanUser = () => {
    chatApi.unbanUser({
      room_id: state.chat.currentRoom!.room_id,
      user_id: props.user.id,
    });
  };

  const onPromoteUser = () => {
    chatApi.promoteUser({
      room_id: state.chat.currentRoom!.room_id,
      user_id: props.user.id,
    });
    notify('user promoted');
  };

  const onDemoteUser = () => {
    chatApi.demoteUser({
      room_id: state.chat.currentRoom!.room_id,
      user_id: props.user.id,
    });
    notify('user demoted');
  };

  createEffect(() => {
    console.log(notify);
  });

  return (
    <Suspense>
      <div
        class={
          props.user.role === 'admin'
            ? 'bg-pink-700 flex items-center justify-between transition-all p-3 hover:opacity-100'
            : `flex items-center justify-between transition-all p-3 opacity-50 hover:opacity-100`
        }
      >
        <div class="flex items-center">
          <Avatar />
          <h1 class="pl-3">{props.user.display_name}</h1>
        </div>
        <AiOutlineMore onClick={() => setIsOpen(true)} />
      </div>
      <Modal isOpen={isOpen()} toggleModal={setIsOpen}>
        <div class="flex flex-col p-3 w-40 border absolute shadow-md rounded-md bg-skin-page border-header-menu -top-6 right-1">
          <Link
            class="text-start hover:bg-gray-600 px-3 rounded-sm transition-all"
            href={`/profile/${props.user.id}`}
          >
            Profile
          </Link>
          <button
            onClick={inviteUser}
            class="text-start hover:bg-gray-600 px-3 rounded-sm transition-all"
          >
            Send invite
          </button>
          <Show
            when={
              currentUserRole() === 'admin' || currentUserRole() === 'owner'
            }
          >
            <button
              onClick={onMuteUser}
              class="text-start hover:bg-gray-600 px-3 rounded-sm transition-all"
            >
              Mute
            </button>
            <button
              onClick={onUnmuteUser}
              class="text-start hover:bg-gray-600 px-3 rounded-sm transition-all"
            >
              Unmute
            </button>
            <button
              onClick={onBanUser}
              class="text-start hover:bg-gray-600 px-3 rounded-sm transition-all"
            >
              Ban
            </button>
            <button
              onClick={onUnbanUser}
              class="text-start hover:bg-gray-600 px-3 rounded-sm transition-all"
            >
              Unban
            </button>
            <button
              onClick={onPromoteUser}
              class="text-start hover:bg-gray-600 px-3 rounded-sm transition-all"
            >
              Promote
            </button>
            <button
              onClick={onDemoteUser}
              class="text-start hover:bg-gray-600 px-3 rounded-sm transition-all"
            >
              Demote
            </button>
          </Show>
        </div>
      </Modal>
    </Suspense>
  );
};

export default ChatRoomUserCard;
