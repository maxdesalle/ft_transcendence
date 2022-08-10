import { batch, createResource } from 'solid-js';
import { SetStoreFunction } from 'solid-js/store';
import { StoreState } from '.';
import { chatApi } from '../api/chat';
import { routes, urls } from '../api/utils';
import { Message } from '../types/chat.interface';
import { User } from '../types/user.interface';
import { api } from '../utils/api';

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
    //2fa

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

    //friends
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
