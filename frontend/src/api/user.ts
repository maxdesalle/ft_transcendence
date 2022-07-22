import { User } from '../types/user.interface';
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

export const changeAvatar = async (data:any) => {
  return await api.post(`${routes.users}/avatar`, data)
}