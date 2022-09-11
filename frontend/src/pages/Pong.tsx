import { Link, useNavigate } from 'solid-app-router';
import { Component, createEffect, onCleanup, onMount, Show } from 'solid-js';
import { p5 } from '../game/newPong';
import { sketch } from '../game/pong';
import { useAuth } from '../Providers/AuthProvider';
import { useSockets } from '../Providers/SocketProvider';
import { useStore } from '../store/StoreProvider';
import { WsNotificationEvent } from '../types/chat.interface';
import { notifyError } from '../utils/helpers';

const Pong: Component = () => {
  let ref: any;
  let game: typeof p5;
  let id: any;
  const navigate = useNavigate();
  const [state] = useStore();
  const [sockets, { send }] = useSockets();
  const [auth] = useAuth();

  onMount(() => {
    game = sketch(p5, navigate);
    game.setRef(ref);
    game.setup();
    id = setInterval(() => game.draw(), 10);
  });

  const inGame = () => state.inGameUsers.includes(auth.user.id);

  onCleanup(() => {
    game.deleteAll();
    clearInterval(id);
    if (
      sockets.notificationWs &&
      sockets.notificationWs.readyState === WebSocket.OPEN
    ) {
    }
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
      <Link class="btn btn-primary" href="/">
        Go Home
      </Link>
      <canvas ref={ref} id="pongCanvas"></canvas>
    </div>
  );
};

export default Pong;
