import toast from 'solid-toast';
import { urls } from '../api/utils';

export const generateImageUrl = (id: number) => {
  return `${urls.backendUrl}/database-files/${id}`;
};

export const notifyError = (msg: string) => toast.error(msg);
export const notifySuccess = (msg: string) => toast.success(msg);
