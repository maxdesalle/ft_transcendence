import { User } from "../types/user.interface";
import { api } from "../utils/api";
import { urls } from "./utils";

export const loginFromMockApi = async (data: string) => {
  return await api.post<User>(`${urls.backendUrl}/mock-auth/login`, {
    login42: data,
  });
};
