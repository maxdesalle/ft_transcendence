import { Message, RoomInfo } from '../types/chat.interface';
import { api } from '../utils/api';
import { routes, urls } from './utils';

export type CreateRoomType = {
  name: string;
  private?: boolean;
  password?: string;
};

export type ChatPostBody = {
  room_id: number;
  user_id: number;
  time_minutes?: number;
};

const createRoom = async (data: CreateRoomType) => {
  const res = await api.post<RoomInfo>(routes.createGroup, data);
  return res;
};

const getRooms = async () => {
  const res = await api.get<RoomInfo[]>(routes.getRooms);
  return res.data;
};

const addUserToRoom = async (data: { room_id: number; user_id: number }) => {
  return await api.post(routes.addUserToRoom, data);
};

const getMessagesByRoomId = async (id: number) => {
  const res = await api.get<Message[]>(`${routes.roomMessages}/${id}`);
  return res.data;
};

const getFriendMessages = async (id: number) => {
  const res = await api.get<Message[]>(`${routes.chat}/dm/${id}`);
  return res.data;
};

const postMessageToRoom = async (data: {
  room_id: number;
  message: string;
}) => {
  return await api.post<Message[]>(routes.sendMessageToRoom, data);
};

const sendDm = async (data: { user_id: number; message: string }) => {
  return await api.post(routes.sendDm, data);
};

export const addUserToRoomByName = async (data: {
  room_id: number;
  user_display_name: string;
}) => {
  return await api.post<RoomInfo>(routes.addUserToRoomByName, data);
};

export const blockUser = async (data: { user_id: number }) => {
  return await api.post<number[]>(routes.blockUser, data);
};

const unblockUser = async (data: { user_id: number }) => {
  return await api.post<number[]>(routes.unblockUser, data);
};

const banUser = async (data: {
  room_id: number;
  user_id: number;
  time_minutes: number;
}) => {
  return await api.post<RoomInfo>(routes.banUser, data);
};

const unbanUser = async (data: ChatPostBody) => {
  return await api.post<RoomInfo>(routes.unbanUser, data);
};

const muteUser = async (data: {
  room_id: number;
  user_id: number;
  time_minutes: number;
}) => {
  return await api.post<RoomInfo>(routes.muteUser, data);
};

const promoteUser = async (data: ChatPostBody) => {
  return await api.post<RoomInfo>(routes.promoteUser, data);
};

const demoteUser = async (data: ChatPostBody) => {
  return await api.post<RoomInfo>(routes.demoteUser, data);
};

const unmuteUser = async (data: { room_id: number; user_id: number }) => {
  return await api.post<RoomInfo>(routes.unmuteUser, data);
};

const joinGroup = async (data: { room_id: number; password: string }) => {
  return await api.post<RoomInfo>(routes.joinGroup, data);
};

const setRoomPassword = async (data: { room_id: number; password: string }) => {
  return await api.post<RoomInfo>(routes.setRoomPassword, data);
};

const setPrivate = async (data: { room_id: number; private: boolean }) => {
  return await api.post<RoomInfo>(routes.setPrivate, data);
};

const setOwner = async (data: { room_id: number; user_id: number }) => {
  return await api.post<RoomInfo>(routes.setOwner, data);
};

const leaveGroup = async (id: number) => {
  return await api.post<RoomInfo[]>(routes.leaveGroup, { room_id: id });
};

const kickUser = async (data: { room_id: number; user_id: number }) => {
  return await api.post<RoomInfo>(routes.kickUser, data);
};

export const chatApi = {
  createRoom,
  getRooms,
  addUserToRoom,
  getMessagesByRoomId,
  getFriendMessages,
  postMessageToRoom,
  sendDm,
  muteUser,
  unmuteUser,
  banUser,
  unbanUser,
  promoteUser,
  demoteUser,
  unblockUser,
  joinGroup,
  setRoomPassword,
  setPrivate,
  setOwner,
  leaveGroup,
  kickUser,
};
