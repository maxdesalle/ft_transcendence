import { AxiosError } from 'axios';
import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { acceptFriendReq, rejectFriendReq } from '../api/user';
import { routes } from '../api/utils';
import { User } from '../types/user.interface';
import { notifyError, notifySuccess } from '../utils/helpers';

const PendingFriendReqCard: Component = () => {
  const onAcceptFriendReq = (id: number) => {
    acceptFriendReq(id)
      .then(() => {
        notifySuccess('success');
        mutate([
          ...pendingFriendReq()!.filter((user) => user.req_user.id !== id),
        ]);
      })
      .catch((err) => notifyError(err.message));
  };

  const onRejectFriendReq = (id: number) => {
    rejectFriendReq(id)
      .then(() => {
        notifySuccess('success: friend request rejected');
        mutate([
          ...pendingFriendReq()!.filter((user) => user.req_user.id !== id),
        ]);
      })
      .catch((err: AxiosError<{ message: string }>) =>
        notifyError(err.response?.data.message as string),
      );
  };
  const [pendingFriendReq, { mutate }] = createTurboResource<
    {
      req_user: User;
      status: number;
    }[]
  >(() => routes.receivedFriendReq);

  return (
    <Show when={pendingFriendReq()}>
      <For each={pendingFriendReq()}>
        {(user) => (
          <div class="flex">
            <h1 class="text-white">{user.req_user.display_name}</h1>
            <button
              onClick={() => onAcceptFriendReq(user.req_user.id)}
              class="btn-primary"
            >
              Accept
            </button>
            <button
              onClick={() => onRejectFriendReq(user.req_user.id)}
              class="btn-secondary"
            >
              Reject
            </button>
          </div>
        )}
      </For>
    </Show>
  );
};

export default PendingFriendReqCard;
