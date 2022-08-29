import {
  Component,
  createContext,
  createEffect,
  createSignal,
  JSXElement,
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
  disconnect: () => void;
}

export const SocketProvider = (props: any) => {
  const [state, setState] = createStore<StoreState>({
    notificationWs: undefined,
    pongWs: undefined,
    pongWsState: WebSocket.CLOSED,
    notifWsState: WebSocket.CLOSED,
  });

  let reconnectAmount: number = 5;
  const [id, setId] = createSignal<any>();

  const actions: ActionsType = {
    connectNotificationWs() {
      setState('notificationWs', new WebSocket(urls.wsUrl));
      setState('notifWsState', WebSocket.CONNECTING);
    },
    connectPongWs() {
      cancelReconnect();
      setState('pongWs', initSocket());
      setState('pongWsState', WebSocket.CONNECTING);
    },
    setNotifState(state) {
      setState('notifWsState', state);
    },
    setWsPongState(state) {
      setState('pongWsState', state);
    },
    disconnect() {
      state.notificationWs?.close();
      state.pongWs?.close();
      setState('notificationWs', undefined);
      setState('pongWs', undefined);
      setState('notifWsState', WebSocket.CLOSED);
      setState('pongWsState', WebSocket.CLOSED);
    },
  };

  createEffect(() => {
    if (state.notificationWs) {
      state.notificationWs.onopen = (e) => {
        setState('notifWsState', WebSocket.OPEN);
      };
      state.notificationWs.onclose = (e) => {
        setState('notifWsState', WebSocket.CLOSED);
      };
    }
  });

  const cancelReconnect = () => {
    if (id()) {
      clearTimeout(id());
    }
  };

  createEffect(() => {
    if (state.pongWs) {
      state.pongWs.onopen = (e) => {
        console.log('pong opened from provider');
        setState('pongWsState', WebSocket.OPEN);
      };
      state.pongWs.onclose = (e) => {
        console.log('Pong Closed From provider');
        setState('pongWsState', WebSocket.CLOSED);
        if (reconnectAmount > 0) {
          console.log('reconnecting pong: ');
          setId(setTimeout(actions.connectPongWs, 3000));
          reconnectAmount--;
        }
      };
    }
  });

  onCleanup(() => {
    actions.disconnect();
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
