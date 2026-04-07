import axiosInstance from './axios';
import { Notification } from '../types';

export const notificationsAPI = {
  list: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<{
      data: Notification[];
      pagination: {
        page: number;
        limit: number;
        total: number;
      };
    }>('/notifications', {
      params: { page, limit },
    });
    return response.data;
  },

  markAsRead: async (id: string) => {
    const response = await axiosInstance.patch<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.post<{ message: string }>('/notifications/read-all');
    return response.data;
  },
};
