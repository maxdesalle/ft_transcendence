import { urls } from '../api/utils';

export const generateImageUrl = (id: number) => {
  return `${urls.backendUrl}/database-files/${id}`;
};
