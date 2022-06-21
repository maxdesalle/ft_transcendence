import { Message, RoomInfoShort } from "../types/chat";
import { useFetch, useFetchById, usePost } from "../utils/reactQuery";
import { routes } from "./utils";

export const useCreateRoom = () => {
  return usePost(routes.createGroup, { invalidQueries: [routes.getRooms] });
};

export const useGetRooms = () => {
  return useFetch<RoomInfoShort[]>(routes.getRooms);
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

export const usePostDm = () => {
  return usePost(routes.sendDm, {});
};
