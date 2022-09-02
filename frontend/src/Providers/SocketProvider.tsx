import Cookies from 'js-cookie';
import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js';
import { createStore } from 'solid-js/store';
import { urls } from '../api/utils';
import { initSocket } from '../game/pong';
import { initViewerSocket } from '../game/viewer';

const SocketContext = createContext<any>();

interface StoreState {
  notificationWs: WebSocket | null;
  pongWs: WebSocket | null;
  viewerWs: WebSocket | null;
  viewerWsState: number;
  notifWsState: number;
  pongWsState: number;
}

interface ActionsType {
  connectNotificationWs: () => void;
  connectPongWs: () => void;
  connectViewerWs: () => void;
  setNotifState: (state: number) => void;
  setWsPongState: (state: number) => void;
  disconnect: () => void;
  send: (data: any, target: 'pong' | 'notif' | 'viewer') => void;
}

export const SocketProvider = (props: any) => {
  const [state, setState] = createStore<StoreState>({
    notificationWs: null,
    pongWs: null,
    viewerWs: null,
    pongWsState: WebSocket.CLOSED,
    notifWsState: WebSocket.CLOSED,
    viewerWsState: WebSocket.CLOSED,
  });

  let reconnectAmount: number = 5;
  const [id, setId] = createSignal<any>();

  const actions: ActionsType = {
    send(data, target) {
      switch (target) {
        case 'notif':
          if (
            state.notificationWs &&
            state.notificationWs.readyState === WebSocket.OPEN
          ) {
            state.notificationWs.send(JSON.stringify(data));
          }
          break;
        case 'pong':
          if (state.pongWs && state.pongWs.readyState === WebSocket.OPEN) {
            state.pongWs.send(JSON.stringify(data));
          }
        case 'viewer':
          if (state.viewerWs && state.viewerWs.readyState === WebSocket.OPEN) {
            state.viewerWs.send(JSON.stringify(data));
          }
          break;
        default:
          break;
      }
    },
    connectNotificationWs() {
      setState('notificationWs', new WebSocket(urls.wsUrl));
      setState('notifWsState', WebSocket.CONNECTING);
    },
    connectPongWs() {
      cancelReconnect();
      setState('pongWs', initSocket());
      setState('pongWsState', WebSocket.CONNECTING);
    },
    connectViewerWs() {
      setState('viewerWs', initViewerSocket());
      setState('viewerWsState', WebSocket.CONNECTING);
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
      setState('notificationWs', null);
      setState('pongWs', null);
      setState('viewerWs', null);
      setState('notifWsState', WebSocket.CLOSED);
      setState('viewerWsState', WebSocket.CLOSED);
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
    if (state.viewerWs) {
      state.viewerWs.onopen = () => {
        setState('viewerWsState', WebSocket.OPEN);
      };
      state.viewerWs.onclose = () => {
        setState('viewerWsState', WebSocket.CLOSED);
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
        setState('pongWsState', WebSocket.OPEN);
      };
      const token = Cookies.get('jwt_token');
      state.pongWs.onclose = (e) => {
        setState('pongWsState', WebSocket.CLOSED);
        if (reconnectAmount > 0 && token) {
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
