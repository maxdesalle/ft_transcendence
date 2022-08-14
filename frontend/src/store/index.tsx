import Cookies from 'js-cookie';
import { createContext, Resource, useContext } from 'solid-js';
import { Message, WsNotificationEvent } from '../types/chat.interface';
import { Friend, User } from '../types/user.interface';
import { createStore, produce } from 'solid-js/store';
import { urls } from '../api/utils';
import { initSocket } from '../game/pong';

const StoreContext = createContext<any>();

export interface ActionsType {
  loadMessages?: (id: number | undefined) => void;
  mutateRoomMsgs?: (message: Message) => void;
  logout?: () => void;
  changeUsername?: (value: string) => void;
  activate2fa?: () => void;
  deactivate2fa?: () => void;
  send2faCode?: (code: string) => void;
  addUserToRoomByName?: (data: {
    room_id: number;
    user_display_name: string;
  }) => void;
  sendFriendReq?: (user_id: number) => void;
  acceptFriendReq?: (user_id: number) => void;
  loadPendingFriendReq?: () => void;
  changeTab: (tab: TAB) => void;
  loadFriendMessages?: (id: number | undefined) => void;
  mutateFriendMsgs?: (msg: Message) => void;
  toggleShowMessages: () => void;
  toggleMatchMaking: (val: boolean) => void;
  refetchFriends?: () => Promise<Friend[]>;
  addPendingFriendReq: (pendigUser: { req_user: User; status: number }) => void;
  setFriendInvitation: (
    data: {
      event: WsNotificationEvent;
      user_id?: number;
    } | null,
  ) => void;
  setToken: (token: string | undefined) => void;
  setCurrentRoomId: (id: number) => void;
  setFriendId: (id: number | undefined) => void;
  setPendigFriendReq: (req: { status: number; req_user: User }[]) => void;
  setFriendReqCount: (val: number) => void;
}

export type Status = 'idle' | 'loading' | 'success' | 'failed';

export enum TAB {
  ROOMS,
  PUBLICROOM,
  FRIENDS,
}

export interface StoreState {
  token: string | undefined;
  error?: any;
  ws: WebSocket;
  chat: {
    status: Status;
    error?: any;
    roomId: number | undefined;
    friendId: number | undefined;
    readonly roomMsgs: Message[] | undefined;
    readonly friendMsgs: Message[] | undefined;
  };
  currentUser: {
    status: Status;
    readonly pendingFriendReq: { req_user: User; status: number }[];
    friendReqCount: number;
    error?: any;
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
    ws: WebSocket;
    friendInvitation: { event: WsNotificationEvent; user_id?: number } | null;
  };
}

export function StoreProvider(props: any) {
  let users: Resource<User[] | undefined>,
    roomMsg: Resource<Message[] | undefined>,
    friendMsg: Resource<Message[] | undefined>;

  const [state, setState] = createStore<StoreState>({
    token: Cookies.get('jwt_token'),
    ws: new WebSocket(urls.wsUrl),
    pong: {
      friendInvitation: null,
      inMatchMaking: false,
      ws: initSocket(),
    },
    chat: {
      status: 'idle',
      get roomMsgs() {
        return roomMsg();
      },
      get friendMsgs() {
        return friendMsg();
      },
      roomId: undefined,
      friendId: undefined,
    },
    chatUi: {
      tab: TAB.PUBLICROOM,
      showMessages: false,
    },
    currentUser: {
      twoFaConfirmed: false,
      status: 'idle',
      twoFaQrCode: '',
      pendingFriendReq: [],
      friendReqCount: 0,
    },
  });

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
