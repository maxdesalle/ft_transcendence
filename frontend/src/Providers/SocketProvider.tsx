import {
  Component,
  createContext,
  createEffect,
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
    disconnect() {
      state.notificationWs?.close();
      state.pongWs?.close();
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

  createEffect(() => {
    if (state.pongWs) {
      state.pongWs.onopen = (e) => {
        setState('pongWsState', WebSocket.OPEN);
      };
      state.pongWs.onclose = (e) => {
        setState('pongWsState', WebSocket.CLOSED);
      };
    }
  });

  // onCleanup(() => {
  //   state.notificationWs?.close();
  //   state.pongWs?.close();
  //   setState('notificationWs', undefined);
  //   setState('pongWs', undefined);
  //   setState('pongWsState', WebSocket.CLOSED);
  //   setState('notifWsState', WebSocket.CLOSED);
  // });

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
