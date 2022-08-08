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
  // TODO: put it in the store
  const [invitation, setInvitation] = createSignal<{
    event: string;
    user_id: number;
  }>();
  onMount(() => {
    myP5 = new p5Type(sketch, ref);
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

  onCleanup(() => {
    myP5.remove();
  });

  return (
    <div class="flex flex-col mt-3 items-center">
      <div ref={ref}></div>
    </div>
  );
};

export default Pong;
