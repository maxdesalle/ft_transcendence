import p5Type from "p5";
import { Component, onCleanup, onMount } from "solid-js";
import { initSocket, sketch } from "../game/pong";

const Pong: Component = () => {
  let ref: any;
  let myP5: p5Type;
  let ws: WebSocket;
  onMount(() => {
    ws = initSocket();
    myP5 = new p5Type(sketch, ref);
  });

  const onPlay = () => {
    const message = { event: "play" };
    ws.send(JSON.stringify(message));
  };

  onCleanup(() => {
    ws.close();
    myP5.remove();
  });
  return (
    <div class="flex flex-col items-center">
      <button onClick={onPlay} class="p-1 border bg-indigo-400 rounded-md w-24">
        Play
      </button>
      <div ref={ref}></div>
    </div>
  );
};

export default Pong;
