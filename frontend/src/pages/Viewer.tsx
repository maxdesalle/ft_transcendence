import { Component, createSignal, onCleanup, onMount } from 'solid-js';
import { initViewerSocket, viewerSketch } from '../game/viewer';
import { p5 } from '../game/newPong';

const Viewer: Component = () => {
  const [ref, setRef] = createSignal<any>();
  let ws: WebSocket;
  let game: typeof p5;
  let id: any;

  onMount(() => {
    ws = initViewerSocket();
    game = viewerSketch(p5);
    game.setRef(ref());
    game.setup();
    id = setInterval(() => game.draw(), 0);
  });

  onCleanup(() => {
    ws.close();
    game.deleteAll();
    clearInterval(id);
  });

  return (
    <div class="flex flex-col items-center pt-3">
      <canvas ref={setRef}></canvas>
    </div>
  );
};

export default Viewer;
