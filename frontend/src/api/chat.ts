import { createResource } from 'solid-js';
import { Message, RoomInfo, RoomInfoShort } from '../types/chat.interface';
import { api } from '../utils/api';
import { routes } from './utils';

type CreateRoomType = {
  name: string;
  private?: boolean;
  password?: string;
};

export const createRoomResource = () => {
  const [data, { mutate, refetch }] = createResource(getRooms);
  return {
    rooms: data,
    mutate,
    refetch,
  };
};

const createRoom = async (data: CreateRoomType) => {
  const res = await api.post<RoomInfoShort[]>(routes.createGroup, data);
  return res;
};

const getRooms = async () => {
  const res = await api.get<RoomInfoShort[]>(routes.getRooms);
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
  return await api.post(routes.blockUser, data);
};

export const unblockUser = async (data: { user_id: number }) => {
  return await api.post(routes.unblockUser, data);
};

export const chatApi = {
  createRoom,
  getRooms,
  addUserToRoom,
  getMessagesByRoomId,
  getFriendMessages,
  postMessageToRoom,
  sendDm,
};
