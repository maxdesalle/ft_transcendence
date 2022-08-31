import {
  Component,
  createEffect,
  createResource,
  createSignal,
  onMount,
  Show,
} from 'solid-js';
import { useStore } from '../store/all';
import Modal from './Modal';
import { TbDeviceGamepad } from 'solid-icons/tb';
import autoAnimate from '@formkit/auto-animate';
import { fetchUserById } from '../api/user';
import { useSockets } from '../Providers/SocketProvider';
import { useNavigate } from 'solid-app-router';

const GameInviteNotif: Component = () => {
  let ref: any;

  const [isNotifOpen, setIsNotifOpen] = createSignal(false);
  const [state, { setFriendInvitation }] = useStore();
  const [user] = createResource(
    () => state.pong.friendInvitation?.user_id,
    fetchUserById,
  );
  const [sockets] = useSockets();
  const navigate = useNavigate();

  onMount(() => {
    autoAnimate(ref);
  });

  function NoInvitation() {
    return (
      <div class="p-2 bg-base-300">
        <p>No Game Invitation</p>
      </div>
    );
  }

  const onAcceptInvite = () => {
    if (user() && sockets.pongWsState === WebSocket.OPEN) {
      sockets.pongWs!.send(
        JSON.stringify({
          event: 'accept',
          data: user()!.id,
        }),
      );
    }
    setIsNotifOpen(false);
    setFriendInvitation(null);
    navigate('/pong');
  };

  const onRejectInvite = () => {
    if (user() && sockets.pongWsState === WebSocket.OPEN) {
      sockets.pongWs!.send(
        JSON.stringify({
          event: 'cancel',
        }),
      );
      setFriendInvitation(null);
      setIsNotifOpen(false);
    }
  };

  return (
    <div
      class="items-center rounded-md justify-center px-2 py-1 leading-none"
      ref={ref}
    >
      <button
        classList={{ 'animate-bounce': !!state.pong.friendInvitation }}
        class="flex items-center text-black"
        onClick={() => setIsNotifOpen(!isNotifOpen())}
      >
        <TbDeviceGamepad size={22} color="#001a4d" />
      </button>
      <Modal isOpen={isNotifOpen()} toggleModal={setIsNotifOpen}>
        <Show
          when={user() && state.pong.friendInvitation}
          fallback={<NoInvitation />}
        >
          <div class="flex flex-col bg-base-300 border  gap-2 w-fit px-2 pt-2">
            <p>{user()!.display_name} invited you to play</p>
            <div class="flex justify-between w-full">
              <button
                onClick={onAcceptInvite}
                class="btn-primary btn btn-xs w-fit"
              >
                Accept
              </button>
              <button
                onClick={onRejectInvite}
                class="btn-secondary btn btn-xs w-fit"
              >
                Reject
              </button>
            </div>
          </div>
        </Show>
      </Modal>
    </div>
  );
};

export default GameInviteNotif;
