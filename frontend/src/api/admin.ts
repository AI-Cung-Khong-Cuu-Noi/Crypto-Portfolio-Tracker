import axiosInstance from './axios';
import { User } from '../types';

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const adminAPI = {
  listUsers: async (page: number = 1, limit: number = 10, search?: string) => {
    const response = await axiosInstance.get<PaginatedResponse<User>>('/admin/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  getUserDetail: async (id: string) => {
    const response = await axiosInstance.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: { name: string; email: string; role: 'USER' | 'ADMIN' }) => {
    const response = await axiosInstance.put<User>(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete<{ message: string }>(`/admin/users/${id}`);
    return response.data;
  },

  resetUserPassword: async (id: string) => {
    const response = await axiosInstance.post<{ message: string; temporaryPassword: string }>(
      `/admin/users/${id}/reset-password`
    );
    return response.data;
  },

  updateUserStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    const response = await axiosInstance.patch<User>(`/admin/users/${id}/status`, { status });
    return response.data;
  },
};
