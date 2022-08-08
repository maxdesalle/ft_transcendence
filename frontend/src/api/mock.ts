import { api } from "../utils/api";
import { urls } from "./utils";

export const loginFromMockApi = async (data: string) => {
  return await api.post(`${urls.backendUrl}/mock-auth/login`, {
    login42: data,
  });
};
