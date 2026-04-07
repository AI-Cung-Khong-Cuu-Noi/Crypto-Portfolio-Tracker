import axiosInstance from './axios';
import { Notification } from '../types';

type NotificationDoc = {
  _id: string;
  userId: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
};

type NotificationsListResponse = {
  success: boolean;
  data: NotificationDoc[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ApiMessage = {
  success: boolean;
  message: string;
};

const mapNotification = (doc: NotificationDoc): Notification => ({
  id: String(doc._id),
  userId: String(doc.userId),
  title: doc.title,
  message: doc.body,
  type: 'SYSTEM',
  isRead: doc.read,
  createdAt: doc.created_at,
});

export const notificationsAPI = {
  list: async (page: number = 1, limit: number = 10) => {
    const response = await axiosInstance.get<NotificationsListResponse>('/notifications', {
      params: { page, limit },
    });
    return {
      data: response.data.data.map(mapNotification),
      pagination: {
        page: response.data.meta.page,
        limit: response.data.meta.limit,
        total: response.data.meta.total,
      },
    };
  },

  markAsRead: async (id: string) => {
    const response = await axiosInstance.patch<{ success: boolean; data: NotificationDoc }>(`/notifications/${id}/read`);
    return mapNotification(response.data.data);
  },

  markAllAsRead: async () => {
    const response = await axiosInstance.post<ApiMessage>('/notifications/read-all');
    return response.data;
  },
};
