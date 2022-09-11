import { AxiosError } from 'axios';
import { Component, For, Show } from 'solid-js';
import { mutate } from 'turbo-solid';
import { acceptFriendReq, rejectFriendReq } from '../api/user';
import { routes } from '../api/utils';
import { useStore } from '../store/StoreProvider';
import { notifyError, notifySuccess } from '../utils/helpers';

const PendingFriendReqCard: Component = () => {
  const [state, { setPendigFriendReq }] = useStore();

  const onAcceptFriendReq = (id: number) => {
    acceptFriendReq(id)
      .then((res) => {
        notifySuccess('success');
        mutate(routes.friends, [...res.data]);
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

  return (
    <Show
      when={state.currentUser.pendingFriendReq.length}
      fallback={
        <p class="bg-base-300 p-3 border-1  shadow-md border-red-600">
          No friend requests 🥲
        </p>
      }
    >
      <div class="border pt-4 shadow-md pb-2 border-base-300 rounded-md px-2 bg-base-200">
        <For each={state.currentUser.pendingFriendReq}>
          {(user) => (
            <div class="flex flex-col gap-2">
              <h1 class="text-base">{user.req_user.display_name}</h1>
              <div class="flex gap-2">
                <button
                  onClick={() => onAcceptFriendReq(user.req_user.id)}
                  class="btn btn-primary btn-xs"
                >
                  Accept
                </button>
                <button
                  onClick={() => onRejectFriendReq(user.req_user.id)}
                  class="btn btn-error btn-xs"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
};

export default PendingFriendReqCard;
