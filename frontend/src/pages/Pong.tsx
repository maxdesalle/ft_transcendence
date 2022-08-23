import { useNavigate } from 'solid-app-router';
import { Component, onCleanup, onMount } from 'solid-js';
import { p5 } from '../game/newPong';
import { sketch } from '../game/pong';
import { useSockets } from '../Providers/SocketProvider';
import { WsNotificationEvent } from '../types/chat.interface';
import { notifyError } from '../utils/helpers';

const Pong: Component = () => {
  let ref: any;
  let game: typeof p5;
  let id: any;
  const navigate = useNavigate();
  const [sockets] = useSockets();

  onMount(() => {
    game = sketch(p5, navigate);
    game.setRef(ref);
    game.setup();
    id = setInterval(() => game.draw(), 0);
    if (sockets.notifWsState === WebSocket.OPEN) {
      sockets.notificationWs!.addEventListener('message', (e) => {
        let res: { event: WsNotificationEvent };
        res = JSON.parse(e.data);
        if (res.event === 'pong: opponent_disconnected') {
          notifyError('player disconnected');
          //onCleanup well clean every thing when i leave the page
          // navigate('/');
        }
      });
    }
  });

  onCleanup(() => {
    game.deleteAll();
    clearInterval(id);
    if (sockets.notifWsState === WebSocket.OPEN) {
      sockets.notificationWs!.removeEventListener('message', () => {});
    }
  });

  return (
    <div class="flex items-center flex-col h-95">
      <canvas ref={ref} id="pongCanvas"></canvas>
    </div>
  );
};

export default Pong;
