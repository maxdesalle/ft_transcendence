import { AxiosError } from 'axios';
import { useNavigate } from 'solid-app-router';
import { Component, For, onMount, Show } from 'solid-js';
import { acceptFriendReq, rejectFriendReq } from '../api/user';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/all';
import { notifyError, notifySuccess } from '../utils/helpers';

const PendingFriendReqCard: Component = () => {
  const [sockets] = useSockets();
  const [state, { setPendigFriendReq, setFriendInvitation }] = useStore();
  const navigate = useNavigate();
  const onAcceptFriendReq = (id: number) => {
    acceptFriendReq(id)
      .then(() => {
        notifySuccess('success');
        setPendigFriendReq(
          state.currentUser.pendingFriendReq.filter(
            (req) => req.req_user.id !== id,
          ),
        );
      })
      .catch((err) => notifyError(err.message));
  };

  const onRejectFriendReq = (id: number) => {
    rejectFriendReq(id)
      .then(() => {
        notifySuccess('success: friend request rejected');
        setPendigFriendReq(
          state.currentUser.pendingFriendReq.filter(
            (req) => req.req_user.id !== id,
          ),
        );
      })
      .catch((err: AxiosError<{ message: string }>) =>
        notifyError(err.response?.data.message as string),
      );
  };

  const onAcceptInvite = () => {
    const data = {
      event: 'accept',
      data: state.pong.friendInvitation?.user_id,
    };
    sockets.pongWs!.send(JSON.stringify(data));
    navigate('/pong');
    setFriendInvitation(null);
  };

  return (
    <Show
      when={
        state.currentUser.pendingFriendReq.length || state.pong.friendInvitation
      }
      fallback={
        <p class="bg-gray-700 p-3 border-1 text-white shadow-md border-red-600">
          No friend requests 🥲
        </p>
      }
    >
      <div class="border border-header-menu p-2 pt-4 shadow-md rounded-md bg-skin-menu-background">
        <For each={state.currentUser.pendingFriendReq}>
          {(user) => (
            <div class="grid grid-cols-2">
              <h1 class="text-white pr-2 text-lg">
                {user.req_user.display_name}
              </h1>
              <div>
                <button
                  onClick={() => onAcceptFriendReq(user.req_user.id)}
                  class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => onRejectFriendReq(user.req_user.id)}
                  class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-sm text-sm px-2 py-1 text-center mr-2 mb-2"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </For>
        <button onClick={onAcceptInvite} class="btn-primary">
          Accept
        </button>
      </div>
    </Show>
  );
};

export default PendingFriendReqCard;
