import Cookies from 'js-cookie';
import QRCode from 'qrcode';
import { batch, createResource } from 'solid-js';
import { SetStoreFunction } from 'solid-js/store';
import { StoreState } from '.';
import { addUserToRoomByName, chatApi, ChatPostBody } from '../api/chat';
import { getAllMatches, getLadder } from '../api/stats';
import { fetchUsers } from '../api/user';
import { routes, urls } from '../api/utils';
import { Message, RoomInfo } from '../types/chat.interface';
import { friendReqEventDto } from '../types/friendship.interface';
import { Friend, User } from '../types/user.interface';
import { api } from '../utils/api';

export const createUsers = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  //TODO: add status
  const [users, { refetch }] = createResource(async () => {
    try {
      return await fetchUsers();
    } catch (error) {}
  });

  Object.assign(actions, {
    refetchUsers() {
      return refetch();
    },
  });
  return users;
};

export const createCurrentUser = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  const [user, { mutate }] = createResource(async () => {
    try {
      const res = await api.get<User>(routes.currentUser);
      setState('currentUser', 'status', 'success');
      return res.data;
    } catch (e) {
      setState('currentUser', 'error', () => e);
    }
  });

  //can add action to change the name, etc...
  Object.assign(actions, {
    logout() {
      Cookies.remove('jwt_token');
      setState('token', undefined);
      mutate(undefined);
    },
    async changeUsername(value: string) {
      const res = await api.post<User>(`${routes.users}/set_display_name`, {
        display_name: value,
      });
      setState(
        'currentUser',
        'userData',
        'display_name',
        () => res.data.display_name,
      );

      const index = state.users?.findIndex(
        (user) => user.id == state.currentUser.userData?.id,
      );
      if (index) {
        setState('users', index, 'display_name', res.data.display_name);
      }
    },

    //2fa
    async activate2fa() {
      try {
        const res = await api.get<{ otpauthUrl: string }>(routes.activate2fa);
        QRCode.toDataURL(res.data.otpauthUrl, function (err, url) {
          batch(() => {
            setState('currentUser', 'twoFaQrCode', url);
            setState('currentUser', 'error', err);
          });
        });
      } catch (e) {
        setState('currentUser', 'error', e);
      }
    },
    async send2faCode(code: string) {
      try {
        const res = await api.post<{ success: boolean }>(
          `${urls.backendUrl}/login/two-factor-authentication/`,
          {
            twoFactorAuthenticationCode: code,
          },
        );
        batch(() => {
          setState('currentUser', 'twoFaConfirmed', res.data.success);
          setState('currentUser', 'status', 'success');
        });
      } catch (e) {
        batch(() => {
          setState('currentUser', 'error', e);
          setState('currentUser', 'status', 'failed');
        });
      }
    },
    async deactivate2fa() {
      try {
        //TODO: change status management looks wrong
        const res = await api.get(routes.deactivate2fa);
        batch(() => {
          setState('token', undefined);
          setState(
            'currentUser',
            'userData',
            'isTwoFactorAuthenticationEnabled',
            false,
          );
          setState('currentUser', 'status', 'success');
        });
      } catch (e) {
        setState('currentUser', 'status', 'failed');
      }
    },

    //friends

    async sendFriendReq(user_id: number) {
      try {
        const res = await api.post(routes.sendFriendReq, { user_id });
        console.log(res.data);
      } catch (e) {}
    },

    async acceptFriendReq(user_id: number) {
      try {
        await api.post<friendReqEventDto>(routes.acceptFriendReq, {
          user_id,
        });
        // await this.loadPendingFriendReq();
      } catch (e) {
        //TODO: server error
      }
    },

    async loadPendingFriendReq() {
      try {
        const res = await api.get<{ req_user_id: number; status: number }[]>(
          routes.receivedFriendReq,
        );
        const pendingFriendReq: { user: User; status: number }[] = [];
        res.data.map((elem) => {
          const pendingUser = state.users?.find(
            (user) => user.id == elem.req_user_id,
          );
          if (pendingUser) {
            pendingFriendReq.push({ user: pendingUser, status: elem.status });
          }
        });
        setState('currentUser', 'pendingFriendReq', [...pendingFriendReq]);
      } catch (e) {}
    },
  });

  return user;
};

export const createRooms = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  const [rooms, { mutate, refetch }] = createResource(
    async () => {
      try {
        const res = await api.get<RoomInfo[]>(routes.getRooms);
        setState('chat', 'status', 'success');
        return res.data;
      } catch (e) {
        setState('chat', 'error', e);
      }
    },
    { initialValue: [] },
  );

  Object.assign(actions, {
    updateRooms(rooms: RoomInfo[]) {
      mutate([...rooms]);
    },
    loadRooms(reload: boolean) {
      if (reload) return refetch();
    },
    async addUserToRoomByName(data: {
      room_id: number;
      user_display_name: string;
    }) {
      try {
        const res = await addUserToRoomByName(data);
        const index = state.chat.rooms?.findIndex(
          (room) => room.room_id === res.data.room_id,
        );
        if (index) {
          setState('chat', 'rooms', index, 'users', () => [...res.data.users]);
          setState('chat', 'status', 'success');
        }
      } catch (error) {
        setState('chat', 'error', error);
      }
    },
  });
  return rooms;
};

export const createMessageById = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  const [messages, { mutate }] = createResource(
    () => state.chat.roomId,
    async (id) => {
      try {
        const res = await chatApi.getMessagesByRoomId(id);
        setState('chat', 'status', 'success');
        return res;
      } catch (error) {
        setState('chat', 'error', error);
      }
    },
    { initialValue: [] },
  );

  Object.assign(actions, {
    mutateRoomMsgs(data: Message) {
      mutate([...state.chat.roomMsgs!, data]);
    },

    loadMessages(id: number | undefined) {
      if (id === undefined) return;
      setState('chat', 'roomId', id);
    },
  });
  return messages;
};

export const createFriends = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  const [friends, { mutate, refetch }] = createResource(
    async () => {
      const res = await api.get<Friend[]>(routes.friends);
      return res.data;
    },
    { initialValue: [] },
  );

  Object.assign(actions, {
    refetchFriends() {
      return refetch();
    },
  });
  return friends;
};

export const createFriendMsg = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  const [friendMsgs, { mutate }] = createResource(
    () => state.chat.friendId,
    chatApi.getFriendMessages,
    { initialValue: [] },
  );

  Object.assign(actions, {
    loadFriendMessages(friendId: number) {
      if (!friendId) return;
      setState('chat', 'friendId', friendId);
    },

    mutateFriendMsgs(msg: Message) {
      mutate([...friendMsgs(), msg]);
    },
  });

  return friendMsgs;
};

export const createMatches = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  const [matches, { mutate }] = createResource(getAllMatches);

  return matches;
};

export const createLadder = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  const [ladder, { mutate }] = createResource(getLadder);

  return ladder;
};
