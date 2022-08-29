import Cookies from 'js-cookie';
import { createContext, Resource, useContext } from 'solid-js';
import { WsNotificationEvent } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { createStore, produce } from 'solid-js/store';

const StoreContext = createContext<any>();

export interface ActionsType {
  changeTab: (tab: TAB) => void;
  toggleShowMessages: () => void;
  toggleMatchMaking: (val: boolean) => void;
  addPendingFriendReq: (pendigUser: { req_user: User; status: number }) => void;
  setFriendInvitation: (
    data: {
      event: WsNotificationEvent;
      user_id?: number;
    } | null,
  ) => void;
  setToken: (token: string | undefined) => void;
  setCurrentRoomId: (id: number | undefined) => void;
  setFriendId: (id: number | undefined) => void;
  setPendigFriendReq: (req: { status: number; req_user: User }[]) => void;
  setFriendReqCount: (val: number) => void;
  addOnlineUser: (user_id: number) => void;
  removeDisconnectedUser: (user_id: number) => void;
  setOnlineUsers: (ids: number[]) => void;
  setInGameUsers: (ids: number[]) => void;
  resetStore: () => void;
  mutateNewMessages: (room_id: number) => void;
}

export type Status = 'idle' | 'loading' | 'success' | 'failed';

export enum TAB {
  HOME,
  ROOMS,
  FRIENDS,
}

export interface StoreState {
  token: string | undefined;
  onlineUsers: number[];
  inGameUsers: number[];
  chat: {
    status: Status;
    roomId: number | undefined;
    friendId: number | undefined;
    newMessages: { room_id: number; nbMgs: number }[];
  };
  currentUser: {
    status: Status;
    readonly pendingFriendReq: { req_user: User; status: number }[];
    friendReqCount: number;
    twoFaQrCode: string;
    twoFaConfirmed: boolean;
  };
  chatUi: {
    showMessages: boolean;
    //whitch tab is currently selected
    tab: TAB;
  };
  pong: {
    inMatchMaking: boolean;
    friendInvitation: { event: WsNotificationEvent; user_id?: number } | null;
  };
}

export function StoreProvider(props: any) {
  const initialState: StoreState = {
    token: Cookies.get('jwt_token'),
    onlineUsers: [],
    inGameUsers: [],
    pong: {
      friendInvitation: null,
      inMatchMaking: false,
    },
    chat: {
      status: 'idle',
      roomId: undefined,
      friendId: undefined,
      newMessages: [],
    },
    chatUi: {
      tab: TAB.HOME,
      showMessages: false,
    },
    currentUser: {
      twoFaConfirmed: false,
      status: 'idle',
      twoFaQrCode: '',
      pendingFriendReq: [],
      friendReqCount: 0,
    },
  };

  const [state, setState] = createStore<StoreState>(initialState);

  const actions: ActionsType = {
    changeTab(tab) {
      setState(
        produce((s) => {
          s.chatUi.tab = tab;
        }),
      );
    },
    toggleShowMessages() {
      setState(
        produce((s) => {
          s.chatUi.showMessages = !s.chatUi.showMessages;
        }),
      );
    },
    toggleMatchMaking(val) {
      setState('pong', 'inMatchMaking', val);
    },
    addPendingFriendReq(pendigUser) {
      setState('currentUser', 'pendingFriendReq', (e) => [...e, pendigUser]);
    },
    setFriendInvitation(data) {
      setState('pong', 'friendInvitation', data);
    },
    setToken(token) {
      setState('token', token);
    },
    setCurrentRoomId(id) {
      setState('chat', 'roomId', id);
    },
    setFriendId(id) {
      setState('chat', 'friendId', id);
    },
    setPendigFriendReq(req) {
      setState('currentUser', 'pendingFriendReq', req);
    },
    setFriendReqCount(val) {
      setState('currentUser', 'friendReqCount', val);
    },
    addOnlineUser(user_id: number) {
      setState('onlineUsers', (e) => [...e, user_id]);
    },
    removeDisconnectedUser(user_id: number) {
      setState('onlineUsers', (e) => [...e.filter((id) => id != user_id)]);
    },
    setOnlineUsers(ids: number[]) {
      setState('onlineUsers', ids);
    },
    setInGameUsers(ids) {
      setState('inGameUsers', ids);
    },
    resetStore() {
      setState(
        produce((e) => {
          e.chat.roomId = undefined;
          e.chat.friendId = undefined;
        }),
      );
    },
    mutateNewMessages(room_id) {
      setState(
        produce((s) => {
          let m = s.chat.newMessages.find((m) => m.room_id === room_id);
          if (!m) {
            s.chat.newMessages.push({ room_id, nbMgs: 1 });
            return;
          }
          const idx = s.chat.newMessages.findIndex(
            (m) => m.room_id === room_id,
          );
        }),
      );
      console.log(state.chat.newMessages);
    },
  };
  const store: [StoreState, ActionsType] = [state, actions];
  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore(): [StoreState, ActionsType] {
  return useContext<[StoreState, ActionsType]>(StoreContext);
}
