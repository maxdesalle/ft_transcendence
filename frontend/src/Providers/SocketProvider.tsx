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
  notificationState: number;
  viewerWsState: number;
  pongWs: WebSocket | null;
  viewerWs: WebSocket | null;
}

interface ActionsType {
  connectNotificationWs: () => void;
  connectPongWs: () => void;
  connectViewerWs: () => void;
  disconnect: () => void;
  send: (data: any, target: 'pong' | 'notif' | 'viewer') => void;
}

export const SocketProvider = (props: any) => {
  const [state, setState] = createStore<StoreState>({
    notificationWs: null,
    notificationState: WebSocket.CLOSED,
    pongWs: null,
    viewerWs: null,
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
      setState('notificationState', WebSocket.CONNECTING);
    },
    connectPongWs() {
      cancelReconnect();
      setState('pongWs', initSocket());
    },
    connectViewerWs() {
      setState('viewerWs', initViewerSocket());
      setState('viewerWsState', WebSocket.CONNECTING);
    },
    disconnect() {
      state.notificationWs?.close();
      state.pongWs?.close();
      state.viewerWs?.close();
      setState('notificationWs', null);
      setState('notificationState', WebSocket.CLOSED);
      setState('pongWs', null);
      setState('viewerWs', null);
      setState('viewerWsState', WebSocket.CLOSED);
    },
  };

  const cancelReconnect = () => {
    if (id()) {
      clearTimeout(id());
    }
  };

  createEffect(() => {
    if (state.notificationWs) {
      state.notificationWs.onopen = () => {
        setState('notificationState', WebSocket.OPEN);
      };
      state.notificationWs.onclose = () => {
        setState('notificationState', WebSocket.CLOSED);
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

  createEffect(() => {
    if (state.pongWs) {
      state.pongWs.onopen = (e) => {};
      const token = Cookies.get('jwt_token');
      state.pongWs.onclose = () => {
        if (reconnectAmount > 0 && token) {
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
