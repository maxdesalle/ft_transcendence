import { User } from "../types/user.interface";
import { useFetch, usePost } from "../utils/reactQuery";
import { routes } from "./utils";

export const useAddFriendById = () => {
  return usePost(`${routes.friends}/send_friend_request`, {
    invalidQueries: [`${routes.friends}/pending_received`],
  });
};

export const useGetPendingFriendRequest = () => {
  const context = useFetch<number[]>(`${routes.friends}/pending_received`);

  return {
    ...context,
    pendingRequests: context.data,
  };
};

export const useAcceptFriendRequest = () => {
  return usePost(`${routes.friends}/accept_friend_request`, {
    invalidQueries: [
      `${routes.friends}/pending_received`,
      `${routes.friends}`,
    ],
  });
};

export const useGetAllFriendsIds = () => {
  const context = useFetch<number[]>(`${routes.friends}/id`);

  return {
    ...context,
    friendsIds: context.data,
  };
};

export const useGetAllFriendsObjects = () => {
  const context = useFetch<User[]>(`${routes.friends}`);
  return {
    ...context,
    friends: context.data
  }
}

export const useSendDmToFriend = () => {
  return usePost(`${routes.sendDm}`, {});
}

export const useRejectFriendRequest = () => {
  return usePost(`${routes.friends}/reject_friend_request`, {
    invalidQueries: [`${routes.friends}/pending_received`],
  });
};
