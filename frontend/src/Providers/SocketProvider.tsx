import { createContext, createSignal, onCleanup, useContext } from 'solid-js';
import { createStore, Store } from 'solid-js/store';
import { urls } from '../api/utils';
import { initSocket } from '../game/pong';
import { WsNotificationEvent } from '../types/chat.interface';

const SocketContext = createContext<any>();

interface StoreState {
  notificationWs?: WebSocket;
  pongWs?: WebSocket;
  notifWsState: number;
  pongWsState: number;
}

interface ActionsType {
  connectNotificationWs: () => void;
  connectPongWs: () => void;
}

export const SocketProvider = (props: any) => {
  const [state, setState] = createStore<StoreState>({
    pongWsState: WebSocket.CLOSED,
    notifWsState: WebSocket.CLOSED,
  });

  const actions: ActionsType = {
    connectNotificationWs() {
      setState('notifWsState', WebSocket.CONNECTING);
      setState('notificationWs', new WebSocket(urls.wsUrl));
    },
    connectPongWs() {
      setState('pongWsState', WebSocket.CONNECTING);
      setState('pongWs', initSocket());
    },
  };

  onCleanup(() => {
    state.notificationWs?.close();
    state.pongWs?.close();
    setState('notificationWs', undefined);
    setState('pongWs', undefined);
  });

  const store = [state, actions];

  return (
    <SocketContext.Provider value={store}>
      {props.children}
    </SocketContext.Provider>
  );
};

export function useSockets(): [StoreState, ActionsType] {
  return useContext(SocketContext);
}
