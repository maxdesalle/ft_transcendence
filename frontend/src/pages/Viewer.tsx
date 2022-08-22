import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { initViewerSocket, viewerSketch } from '../game/viewer';
import { p5 } from '../game/newPong';
import { useParams } from 'solid-app-router';

const Viewer: Component = () => {
  const [ref, setRef] = createSignal<any>();
  const param = useParams<{ id: string }>();
  let ws: WebSocket;
  let game: typeof p5;
  let id: any;

  onMount(() => {
    ws = initViewerSocket();
    game = viewerSketch(p5);
    game.setRef(ref());
    game.setup();
    id = setInterval(() => game.draw(), 0);
    game.sessionId = Number(param.id);
  });

  onCleanup(() => {
    ws.close();
    game.deleteAll();
    clearInterval(id);
  });

  createEffect(() => {
    console.log('ID: ', game.sessionId);
  });

  return (
    <div class="flex flex-col h-95 items-center pt-3">
      <canvas ref={setRef}></canvas>
    </div>
  );
};

export default Viewer;
