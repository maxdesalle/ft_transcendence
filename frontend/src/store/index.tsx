import Cookies from 'js-cookie';
import { createContext, Resource, useContext } from 'solid-js';
import { Message, RoomInfoShort } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { createStore, produce } from 'solid-js/store';
import {
  createCurrentUser,
  createFriends,
  createMessageById,
  createRooms,
  createUsers,
} from './storeActions';

const StoreContext = createContext<any>();

export interface ActionsType {
  loadMessages?: (id: number | undefined) => void;
  mutate?: (message: Message) => void;
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
}

export type Status = 'idle' | 'loading' | 'success' | 'failed';

export interface StoreState {
  token: string | undefined;
  error?: any;
  chat: {
    status: Status;
    currentRoom: RoomInfoShort | undefined;
    error?: any;
    roomId: number | undefined;
    readonly rooms: RoomInfoShort[] | undefined;
    readonly messages: Message[] | undefined;
  };
  currentUser: {
    status: Status;
    readonly userData: User | undefined;
    readonly friends: User[] | undefined;
    readonly pendingFriendReq: { user: User; status: number }[] | undefined;
    error?: any;
    twoFaQrCode: string;
    twoFaConfirmed: boolean;
  };
  readonly users: User[] | undefined;
}

export function StoreProvider(props: any) {
  let users: Resource<User[] | undefined>,
    rooms: Resource<RoomInfoShort[] | undefined>,
    friends: Resource<User[] | undefined>,
    pendingFriendReq: Resource<{ user_id: number; status: number }>,
    currentUser: Resource<User | undefined>,
    messages: Resource<Message[] | undefined>;

  const [state, setState] = createStore<StoreState>({
    token: Cookies.get('jwt_token'),
    chat: {
      status: 'idle',
      get rooms() {
        return rooms();
      },
      get messages() {
        return messages();
      },
      roomId: undefined,
      currentRoom: undefined,
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
      pendingFriendReq: undefined,
      // get pendingFriendReq() {
      //   return pendingFriendReq();
      // },
      // add friends, match history, etc ...

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
  };
  const store: [StoreState, ActionsType] = [state, actions];
  users = createUsers(actions, state, setState);
  currentUser = createCurrentUser(actions, state, setState);
  rooms = createRooms(actions, state, setState);
  messages = createMessageById(actions, state, setState);
  friends = createFriends(actions, state, setState);
  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore(): [StoreState, ActionsType] {
  return useContext<[StoreState, ActionsType]>(StoreContext);
}
