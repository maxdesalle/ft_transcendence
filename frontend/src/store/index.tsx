import Cookies from "js-cookie";
import { createContext, Resource, useContext } from "solid-js";
import { Message, RoomInfoShort } from "../types/chat.interface";
import { User } from "../types/user.interface";
import { createStore } from "solid-js/store";
import {
  createCurrentUser,
  createMessageById,
  createRooms,
  createUsers,
} from "./createUsers";

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
  send2faCode?: (code: string) => void;
  getUserById: (id: number) => User | undefined;
  addUserToRoomByName?: (data: {
    room_id: number;
    user_display_name: string;
  }) => void;
}

export type Status = "idle" | "loading" | "success" | "failed";

export interface StoreState {
  token: string | undefined;
  error?: any;
  chat: {
    status: Status;
    readonly rooms: RoomInfoShort[] | undefined;
    readonly messages: Message[] | undefined;
    readonly currentRoom: RoomInfoShort | undefined;
    error?: any;
    roomId: number | undefined;
  };
  currentUser: {
    status: Status;
    readonly userData: User | undefined;
    error?: any;
    twoFaQrCode: string;
    twoFaConfirmed: boolean;
  };
  readonly users: User[] | undefined;
}

export function StoreProvider(props: any) {
  let users: Resource<User[] | undefined>,
    rooms: Resource<RoomInfoShort[] | undefined>,
    currentRoom: Resource<RoomInfoShort | undefined>,
    currentUser: Resource<User | undefined>,
    messages: Resource<Message[] | undefined>;

  const [state, setState] = createStore<StoreState>({
    token: Cookies.get("jwt_token"),
    chat: {
      status: "idle",
      get rooms() {
        return rooms();
      },
      get messages() {
        return messages();
      },
      get currentRoom() {
        return currentRoom();
      },
      roomId: undefined,
    },

    currentUser: {
      twoFaConfirmed: false,
      status: "idle",
      twoFaQrCode: "",
      get userData() {
        return currentUser();
      },
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
  };
  const store: [StoreState, ActionsType] = [state, actions];
  users = createUsers(actions, state, setState);
  currentUser = createCurrentUser(actions, state, setState);
  rooms = createRooms(actions, state, setState);
  messages = createMessageById(actions, state, setState);
  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore(): [StoreState, ActionsType] {
  return useContext<[StoreState, ActionsType]>(StoreContext);
}
