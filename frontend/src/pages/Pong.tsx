import p5Type from 'p5';
import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { initSocket, sketch } from '../game/pong';

const Pong: Component = () => {
  let ref: any;
  let myP5: p5Type;
  let ws: WebSocket;
  const [friendId, setFriendId] = createSignal(0);
  onMount(() => {
    ws = initSocket();
    myP5 = new p5Type(sketch, ref);
  });

  const onPlay = () => {
    const message = { event: 'play' };
    ws.send(JSON.stringify(message));
  };

  const onInviteFriend = () => {
    if (!friendId()) return;
    console.log('sending to: ', friendId());
    const data = {
      event: 'invite',
      data: friendId(),
    };
    ws.send(JSON.stringify(data));
  };

  onCleanup(() => {
    ws.close();
    myP5.remove();
  });
  return (
    <div class="flex flex-col items-center">
      <div class="flex">
        <button
          onClick={onPlay}
          class="p-1 border bg-indigo-400 rounded-md w-24"
        >
          Play
        </button>
        <div>
          <input
            onInput={(e) => setFriendId(parseInt(e.currentTarget.value))}
            type="number"
          />
          <button class="btn-primary" onClick={onInviteFriend}>
            Invite
          </button>
        </div>
      </div>
      <div ref={ref}></div>
    </div>
  );
};

export default Pong;
