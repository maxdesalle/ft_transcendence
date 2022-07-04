import { Message, RoomInfoShort } from '../types/chat.interface';
import { useFetch, useFetchById, usePost } from '../utils/reactQuery';
import { routes } from './utils';

export const useCreateRoom = () => {
  return usePost(routes.createGroup, { invalidQueries: [routes.getRooms] });
};

export const useGetRooms = () => {
  const context = useFetch<RoomInfoShort[]>(routes.getRooms);
  return {
    ...context,
    rooms: context.data,
  };
};

export const useAddUserToRoom = () => {
  return usePost(routes.addUserToRoom, {});
};

export const useGetMessagesByRoomId = (id: number | undefined) => {
  const context = useFetchById<Message[]>(`${routes.roomMessages}`, id);
  return {
    ...context,
    messages: context.data,
  };
};

export const useGetFriendMessages = (id: number | undefined) => {
  const context = useFetchById<Message[]>(`${routes.chat}/dm`, id);
  return {
    ...context,
    friendmessages: context.data,
  };
};

export const usePostMsgToRoom = () => {
  return usePost(routes.sendMessageToRoom, {});
};
