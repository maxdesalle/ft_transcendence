import { Component, For, Show } from 'solid-js';
import { useStore } from '../store';

const PendingFriendReqCard: Component = () => {
  const [state, { acceptFriendReq, refetchFriends }] = useStore();

  const onAcceptFriendReq = (id: number) => {
    if (acceptFriendReq && refetchFriends) {
      acceptFriendReq(id);
      refetchFriends();
      console.log('refecting friends');
    }
  };
  return (
    <Show when={state.currentUser.pendingFriendReq}>
      <For each={state.currentUser.pendingFriendReq}>
        {(data) => (
          <div class="flex">
            <h1 class="text-white">{data.user.display_name}</h1>
            <button
              onClick={() => onAcceptFriendReq(data.user.id)}
              class="btn-primary"
            >
              Accept
            </button>
          </div>
        )}
      </For>
    </Show>
  );
};

export default PendingFriendReqCard;
