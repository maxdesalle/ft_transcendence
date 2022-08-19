import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js';
import { createStore, Store } from 'solid-js/store';
import { urls } from '../api/utils';
import { initSocket } from '../game/pong';

const SocketContext = createContext<any>();

interface StoreState {
  notificationWs: WebSocket | undefined;
  pongWs: WebSocket | undefined;
  notifWsState: number;
  pongWsState: number;
}

interface ActionsType {
  connectNotificationWs: () => void;
  connectPongWs: () => void;
  setNotifState: (state: number) => void;
  setWsPongState: (state: number) => void;
}

export const SocketProvider = (props: any) => {
  const [state, setState] = createStore<StoreState>({
    notificationWs: undefined,
    pongWs: undefined,
    pongWsState: WebSocket.CLOSED,
    notifWsState: WebSocket.CLOSED,
  });

  const actions: ActionsType = {
    connectNotificationWs() {
      setState('notificationWs', new WebSocket(urls.wsUrl));
      setState('notifWsState', WebSocket.CONNECTING);
    },
    connectPongWs() {
      setState('pongWs', initSocket());
      setState('pongWsState', WebSocket.CONNECTING);
    },
    setNotifState(state) {
      setState('notifWsState', state);
    },
    setWsPongState(state) {
      setState('pongWsState', state);
    },
  };

  createEffect(() => {
    // if (state.notifWsState && state)
  });

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
