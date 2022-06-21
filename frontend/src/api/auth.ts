import { User } from "../types/user.interface";
import { useFetch, usePost } from "../utils/reactQuery";
import Cookies from "js-cookie";
import { QueryClient } from "react-query";
import { NavigateFunction } from "react-router-dom";
import { routes } from "./utils";

const BASE_URL = "http://localhost:3000";

export const useGetProfile = () => {
  const context = useFetch<User>(`${BASE_URL}/users/me`, undefined, {
    retry: false,
  });
  return { ...context, data: context.data };
};

export const logout = (
  queryClient: QueryClient,
  navigate: NavigateFunction
) => {
  Cookies.remove("jwt_token");
  localStorage.removeItem("user");
  localStorage.removeItem("jwt_token");
  queryClient.removeQueries();
  navigate("/login");
};

export const useTwoFactorAuth = () => {
  return usePost(`${BASE_URL}/login/two-factor-authentication/`, {});
};

export const useActivateTwoFactorAuth = (url: string | null) => {
  const context = useFetch<any>(url, undefined, undefined);
  return { ...context, data: context.data };
};

export const useDeactivateTwoFactorAuth = () => {
  return usePost(`${BASE_URL}/settings/deactivate-2fa`, {
    invalidQueries: [routes.currentUser],
  });
};

//mock login

export const useMockLogin = () => {
  return usePost(`${BASE_URL}/mock-auth/login`, {});
};
