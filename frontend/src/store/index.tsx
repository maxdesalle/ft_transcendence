import Cookies from 'js-cookie';
import { createContext, Resource, useContext } from 'solid-js';
import { Message, RoomInfoShort } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { createStore, produce } from 'solid-js/store';
import {
  createCurrentUser,
  createFriendMsg,
  createFriends,
  createMessageById,
  createRooms,
  createMatches,
  createUsers,
  createLadder,
} from './storeActions';
import { urls } from '../api/utils';
import { initSocket } from '../game/pong';
import { LadderDto, MatchDTO } from '../types/stats.interface';

const StoreContext = createContext<any>();

export interface ActionsType {
  loadMessages?: (id: number | undefined) => void;
  mutateRoomMsgs?: (message: Message) => void;
  updateRooms?: (rooms: RoomInfoShort[]) => RoomInfoShort[] | undefined;
  loadRooms?: (reload: boolean) => void;
  getRoomById: (id: number) => RoomInfoShort | undefined;
  logout?: () => void;
  changeUsername?: (value: string) => void;
  activate2fa?: () => void;
  deactivate2fa?: () => void;
  send2faCode?: (code: string) => void;
  getUserById: (id: number) => User | undefined;
  addUserToRoomByName?: (data: {
    room_id: number;
    user_display_name: string;
  }) => void;
  setCurrentRoom: (room: RoomInfoShort) => void;
  sendFriendReq?: (user_id: number) => void;
  acceptFriendReq?: (user_id: number) => void;
  loadPendingFriendReq?: () => void;
  changeTab: (tab: TAB) => void;
  loadFriendMessages?: (id: number | undefined) => void;
  mutateFriendMsgs?: (msg: Message) => void;
  toggleShowMessages: () => void;
  updateAvatarId: () => void;
  loadApp: () => void;
  toggleMatchMaking: (val: boolean) => void;
  refetchFriends?: () => void;
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
    currentRoom: RoomInfoShort | undefined;
    error?: any;
    roomId: number | undefined;
    friendId: number | undefined;
    readonly rooms: RoomInfoShort[] | undefined;
    readonly roomMsgs: Message[] | undefined;
    readonly friendMsgs: Message[] | undefined;
  };
  currentUser: {
    status: Status;
    readonly userData: User | undefined;
    readonly friends: User[];
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
    matches: MatchDTO[] | undefined;
    ladder: LadderDto[] | undefined;
  };
  readonly users: User[] | undefined;
}

export function StoreProvider(props: any) {
  let users: Resource<User[] | undefined>,
    rooms: Resource<RoomInfoShort[] | undefined>,
    friends: Resource<User[] | []>,
    currentUser: Resource<User | undefined>,
    roomMsg: Resource<Message[] | undefined>,
    friendMsg: Resource<Message[] | undefined>,
    matches: Resource<MatchDTO[] | undefined>,
    ladder: Resource<LadderDto[] | undefined>;

  const [state, setState] = createStore<StoreState>({
    token: Cookies.get('jwt_token'),
    ws: new WebSocket(urls.wsUrl),
    pong: {
      inMatchMaking: false,
      ws: initSocket(),
      get matches() {
        return matches();
      },
      get ladder() {
        return ladder();
      },
    },
    chat: {
      status: 'idle',
      get rooms() {
        return rooms();
      },
      get roomMsgs() {
        return roomMsg();
      },
      get friendMsgs() {
        return friendMsg();
      },
      roomId: undefined,
      currentRoom: undefined,
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
      get userData() {
        return currentUser();
      },
      get friends() {
        return friends();
      },
      pendingFriendReq: [],
      //actions: change name, update avatar
    },
    get users() {
      return users();
    },
  });

  const actions: ActionsType = {
    getRoomById(id: number) {
      return rooms()?.find((room) => room.room_id === id);
    },
    getUserById(id: number) {
      return users()?.find((user) => user.id === id);
    },
    setCurrentRoom(room: RoomInfoShort) {
      setState(
        produce((s) => {
          s.chat.currentRoom = room;
        }),
      );
    },
    changeTab(tab: TAB) {
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
    updateAvatarId() {
      setState('currentUser', 'userData', 'avatarId', (id) => id + 1);
    },
    loadApp() {
      users = createUsers(actions, state, setState);
      currentUser = createCurrentUser(actions, state, setState);
      rooms = createRooms(actions, state, setState);
      roomMsg = createMessageById(actions, state, setState);
      friends = createFriends(actions, state, setState);
      friendMsg = createFriendMsg(actions, state, setState);
    },
    toggleMatchMaking(val: boolean) {
      setState('pong', 'inMatchMaking', val);
    },
  };
  const store: [StoreState, ActionsType] = [state, actions];
  users = createUsers(actions, state, setState);
  currentUser = createCurrentUser(actions, state, setState);
  rooms = createRooms(actions, state, setState);
  roomMsg = createMessageById(actions, state, setState);
  friends = createFriends(actions, state, setState);
  friendMsg = createFriendMsg(actions, state, setState);
  matches = createMatches(actions, state, setState);
  ladder = createLadder(actions, state, setState);
  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore(): [StoreState, ActionsType] {
  return useContext<[StoreState, ActionsType]>(StoreContext);
}
