import { friendReqEventDto } from '../types/friendship.interface';
import { Friend, User } from '../types/user.interface';
import { api } from '../utils/api';
import { routes } from './utils';

export const fetchUsers = async () => {
  const res = await api.get<User[]>(routes.users);
  return res.data;
};

export const fetchUserById = async (id: number) => {
  const res = await api.get<User>(`${routes.users}/${id}`);
  return res.data;
};

export const changeAvatar = async (data: any) => {
  return await api.post<number>(`${routes.users}/avatar`, data);
};

export const changeDisplayName = async (value: string) => {
  return await api.post<User>(`${routes.users}/set_display_name`, {
    display_name: value,
  });
};

export const activate2fa = async () => {
  const res = await api.get<{ otpauthUrl: string }>(routes.activate2fa);
  return res.data;
};

export const deactivate2fa = async () => {
  return await api.get(routes.deactivate2fa);
};

export const acceptFriendReq = async (user_id: number) => {
  return await api.post<Friend[]>(routes.acceptFriendReq, {
    user_id,
  });
};

export const rejectFriendReq = async (user_id: number) => {
  return await api.post(routes.rejectFriendReq, { user_id });
};

export const sendFriendReq = async (user_id: number) => {
  return await api.post(routes.sendFriendReq, { user_id });
};
