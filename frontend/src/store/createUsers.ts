import Cookies from 'js-cookie';
import { createResource } from 'solid-js';
import { SetStoreFunction } from 'solid-js/store';
import { Status, StoreState } from '.';
import { addUserToRoomByName, chatApi } from '../api/chat';
import { routes, urls } from '../api/utils';
import { Message, RoomInfoShort } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { api } from '../utils/api';
import QRCode from 'qrcode';

export const createUsers = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  //TODO: add status
  const [users] = createResource(async () => {
    try {
      const res = await api.get<User[]>(routes.users);
      return res.data;
    } catch (error) {}
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
      setState('currentUser', 'status', () => 'success' as Status);
      return res.data;
    } catch (e) {
      setState('currentUser', 'error', () => e);
    }
  });

  //can add action to change the name, etc...
  Object.assign(actions, {
    logout() {
      Cookies.remove('jwt_token');
      setState('token', () => undefined);
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
    },
    async activate2fa() {
      try {
        const res = await api.get<{ otpauthUrl: string }>(routes.activate2fa);
        QRCode.toDataURL(res.data.otpauthUrl, function (err, url) {
          setState('currentUser', 'twoFaQrCode', () => url);
          setState('currentUser', 'error', err);
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
        setState('currentUser', 'twoFaConfirmed', res.data.success);
        setState('currentUser', 'status', 'success');
      } catch (e) {
        setState('currentUser', 'error', e);
        setState('currentUser', 'status', 'failed');
      }
    },
  });
  return user;
};

export const createRooms = (
  actions: Object,
  state: StoreState,
  setState: SetStoreFunction<StoreState>,
) => {
  const [rooms, { mutate, refetch }] = createResource(async () => {
    try {
      const res = await api.get<RoomInfoShort[]>(routes.getRooms);
      setState('chat', 'status', 'success');
      return res.data;
    } catch (e) {
      setState('chat', 'error', e);
    }
  });

  Object.assign(actions, {
    updateRooms(rooms: RoomInfoShort[]) {
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
          // TODO: the api needs to return the newly added participant
          // setState("chat", "rooms", index, 'participants', );
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
    mutate(data: Message) {
      mutate([...state.chat.messages!, data]);
    },

    loadMessages(id: number | undefined) {
      if (id === undefined) return;
      setState('chat', 'roomId', id);
    },
  });
  return messages;
};
