import Cookies from 'js-cookie';
import { createContext, createResource, Resource, useContext } from 'solid-js';
import {
  Message,
  RoomInfo,
  WsNotificationEvent,
} from '../types/chat.interface';
import { Friend, User } from '../types/user.interface';
import { createStore, produce } from 'solid-js/store';
import { createFriendMsg, createMessageById } from './storeActions';
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
  addPendingFriendReq: (pendigUser: { user: User; status: number }) => void;
  setFriendInvitation: (
    data: {
      event: WsNotificationEvent;
      user_id?: number;
    } | null,
  ) => void;
  setToken: (token: string | undefined) => void;
  setCurrentRoomId: (id: number) => void;
  setFriendId: (id: number | undefined) => void;
}

export type Status = 'idle' | 'loading' | 'success' | 'failed';

export enum TAB {
  ROOMS,
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
    readonly pendingFriendReq: { user: User; status: number }[];
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
  readonly users: User[] | undefined;
  test: User[];
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
      tab: TAB.ROOMS,
      showMessages: false,
    },
    currentUser: {
      twoFaConfirmed: false,
      status: 'idle',
      twoFaQrCode: '',
      pendingFriendReq: [],
      //actions: change name, update avatar
    },
    get users() {
      return users();
    },
    test: [],
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
    //TODO: get the actoual id from the request
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
  };
  const store: [StoreState, ActionsType] = [state, actions];
  roomMsg = createMessageById(actions, state, setState);
  friendMsg = createFriendMsg(actions, state, setState);
  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore(): [StoreState, ActionsType] {
  return useContext<[StoreState, ActionsType]>(StoreContext);
}
