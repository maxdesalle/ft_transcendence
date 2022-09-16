import { Link, useNavigate } from 'solid-app-router';
import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';
import { p5 } from '../game/newPong';
import { sketch } from '../game/pong';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/StoreProvider';

const Pong: Component = () => {
  let ref: any;
  let game: typeof p5;
  let id: any;
  const navigate = useNavigate();
  const [state] = useStore();
  const [sockets, { send }] = useSockets();
  const [auth] = useAuth();
  const [btnRef, setBtnRef] = createSignal<any>();

  onMount(() => {
    game = sketch(p5, navigate);
    game.setRef(ref);
    game.setup(btnRef());
    id = setInterval(() => game.draw(), 10);
  });

  onCleanup(() => {
    game.deleteAll();
    clearInterval(id);
  });

  createEffect(() => {
    if (
      sockets.notificationWs &&
      sockets.notificationState === WebSocket.OPEN
    ) {
      send(
        {
          event: 'isInGame',
          data: { sender: auth.user.id },
        },
        'notif',
      );
      send(
        {
          event: 'isOnline',
          data: { sender: auth.user.id },
        },
        'notif',
      );
    }
  });

  return (
    <div class="flex items-center flex-col h-95">
      <canvas ref={ref} id="pongCanvas"></canvas>
    </div>
  );
};

export default Pong;
