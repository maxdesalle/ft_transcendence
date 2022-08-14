import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { initViewerSocket, viewerSketch } from '../game/viewer';
import { p5 } from '../game/newPong';

const Viewer: Component = () => {
  const [ref, setRef] = createSignal<any>();
  let ws: WebSocket;

  onMount(() => {
    ws = initViewerSocket();
    const game = viewerSketch(p5);
    game.setRef(ref());
    game.setup();
    setInterval(() => game.draw(), 0);
  });

  onCleanup(() => {
    ws.close();
  });

  return (
    <div class="flex flex-col items-center pt-3">
      <canvas ref={setRef}></canvas>
    </div>
  );
};

export default Viewer;
