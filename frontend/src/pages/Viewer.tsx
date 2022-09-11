import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { viewerSketch } from '../game/viewer';
import { p5 } from '../game/newPong';
import { useParams } from 'solid-app-router';
import { useSockets } from '../Providers/SocketProvider';
import { urls } from '../api/utils';
import { createTurboResource } from 'turbo-solid';
import { GameSession } from '../types/Game.interface';

const Viewer: Component = () => {
  const [ref, setRef] = createSignal<any>();
  const param = useParams<{ id: string }>();
  const [sockets, { connectViewerWs }] = useSockets();
  let game: typeof p5;
  const [ready, setReady] = createSignal(false);
  let id: any;

  onMount(() => {
    connectViewerWs();
    game = viewerSketch(p5);
    game.setRef(ref());
    game.setup();
    id = setInterval(() => game.draw(), 0);
    game.sessionId = Number(param.id);
    setReady(true);
  });

  onCleanup(() => {
    game.deleteAll();
    clearInterval(id);
    if (sockets.viewerWs) {
      sockets.viewerWs.close();
    }
  });

  createEffect(() => {
    if (ready()) {
      if (sockets.viewerWs && sockets.viewerWsState === WebSocket.OPEN) {
        sockets.viewerWs.send(JSON.stringify({ id: +param.id }));
      }
    }
  });

  return (
    <div class="flex flex-col h-95 items-center pt-3">
      <canvas ref={setRef}></canvas>
    </div>
  );
};

export default Viewer;
