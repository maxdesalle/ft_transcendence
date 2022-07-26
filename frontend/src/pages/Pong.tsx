import p5Type from 'p5';
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from 'solid-js';
import { unwrap } from 'solid-js/store';
import { sketch } from '../game/pong';
import { useStore } from '../store';

const Pong: Component = () => {
  let ref: any;
  let myP5: p5Type;
  const [friendId, setFriendId] = createSignal(0);
  const [state, { toggleMatchMaking }] = useStore();
  const [invitation, setInvitation] = createSignal<{
    event: string;
    user_id: number;
  }>();
  onMount(() => {
    myP5 = new p5Type(sketch, ref);
    state.ws.addEventListener('message', (e) => {
      const res = JSON.parse(e.data);
      if (res.event === 'pong: invitation') {
        setInvitation(res);
      }
    });
  });

  const onAcceptInvite = () => {
    const data = { event: 'accept', data: invitation()?.user_id };
    state.pong.ws.send(JSON.stringify(data));
    setInvitation(undefined);
  };

  const onPlay = () => {
    const message = { event: 'play' };
    state.pong.ws.send(JSON.stringify(message));
    toggleMatchMaking(true);
  };

  const onInviteFriend = () => {
    if (!friendId()) return;
    const data = {
      event: 'invite',
      data: friendId(),
    };
    state.pong.ws.send(JSON.stringify(data));
  };

  createEffect(() => {
    console.log(unwrap(state.pong.ladder));
  });

  onCleanup(() => {
    myP5.remove();
    // cancel the matchmaking when leaving the page
    toggleMatchMaking(false);
  });
  
  return (
    <div class="flex flex-col">
      <div class="flex">
        <button
          onClick={onPlay}
          class="p-1 border bg-indigo-400 rounded-md w-24"
        >
          Play
        </button>
        <button
          class="btn-primary w-fit"
          onClick={() => toggleMatchMaking(false)}
        >
          Cancel
        </button>
        <div>
          <input
            onInput={(e) => setFriendId(parseInt(e.currentTarget.value))}
            type="number"
          />
          <button class="btn-primary" onClick={onInviteFriend}>
            Invite
          </button>
          <Show when={invitation()}>
            <button class="btn-primary" onClick={onAcceptInvite}>
              Accept
            </button>
          </Show>
        </div>
      </div>
      <div ref={ref}></div>
    </div>
  );
};

export default Pong;
