import { Component, createEffect, createSignal, For, Show } from 'solid-js';
import { createTurboResource } from 'turbo-solid';
import { acceptFriendReq } from '../api/user';
import { routes } from '../api/utils';
import { User } from '../types/user.interface';
import { notifyError, notifySuccess } from '../utils/helpers';

const PendingFriendReqCard: Component = () => {
  const onAcceptFriendReq = (id: number) => {
    acceptFriendReq(id)
      .then(() => {
        notifySuccess('success');
      })
      .catch((err) => notifyError(err.message));
  };
  const [pendingFriendReq] = createTurboResource<
    {
      req_user_id: number;
      status: number;
    }[]
  >(() => routes.receivedFriendReq);

  const [users] = createTurboResource<User[]>(() => routes.users);
  const pendigUsers = () =>
    users()?.filter((u) => {
      const s = pendingFriendReq()?.map((a) => a.req_user_id);
      return s?.includes(u.id);
    });

  return (
    <Show when={pendigUsers()}>
      <For each={pendigUsers()}>
        {(user) => (
          <div class="flex">
            <h1 class="text-white">{user.display_name}</h1>
            <button
              onClick={() => onAcceptFriendReq(user.id)}
              class="btn-primary"
            >
              Accept
            </button>
            <button
              onClick={() => onAcceptFriendReq(user.id)}
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
