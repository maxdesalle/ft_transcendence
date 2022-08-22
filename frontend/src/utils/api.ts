import axios from 'axios';

export const api = {
  get: <T>(url: string, params?: object) =>
    axios.get<T>(url, { withCredentials: true, ...params }),
  post: <T>(url: string, data: any) =>
    axios.post<T>(url, data, { withCredentials: true }),
  delete: <T>(url: string) => axios.delete<T>(url, { withCredentials: true }),
  patch: <T>(url: string, data: any) =>
    axios.patch<T>(url, data, { withCredentials: true }),
};
