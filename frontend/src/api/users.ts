import axiosInstance from './axios';
import { User } from '../types';

export const usersAPI = {
  getProfile: async () => {
    const response = await axiosInstance.get<User>('/users/me');
    return response.data;
  },

  updateProfile: async (data: { name: string; email: string }) => {
    const response = await axiosInstance.put<User>('/users/me', data);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await axiosInstance.put<{ message: string }>('/users/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
