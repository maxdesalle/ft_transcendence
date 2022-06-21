import { User } from "../types/user.interface";
import { useFetch, usePost } from "../utils/reactQuery";
import { routes } from "./utils";

export const useGetAvatar = () => {
  const context = useFetch<any>(`${routes.users}/user/avatar`, undefined, {
    retry: false,
  });
  //TODO change the endpoint res
  return { ...context, imageUrl: "http://localhost:3000/users/avatar" };
};

export const useGetUserById = (id: number) => {
  const context = useFetch<User>(`${routes.users}`, id.toString());
  return { ...context, user: context.data };
};

export const usePostAvatar = () => {
  return usePost(`${routes.users}/avatar`, {});
};

export const useGetAllUsers = () => {
  const context = useFetch<User[]>(`${routes.users}`);
  return {
    ...context,
    users: context.data,
  };
};
