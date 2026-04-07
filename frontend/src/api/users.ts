import axiosInstance from './axios';
import { User } from '../types';

type UserApiPayload = {
  _id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'BANNED';
  created_at: string;
  updated_at: string;
  avatar?: string;
};

type UserApiResponse = {
  success: boolean;
  message?: string;
  data: UserApiPayload;
};

type ChangePasswordResponse = {
  success: boolean;
  message: string;
};

const mapUser = (user: UserApiPayload): User => ({
  id: user._id,
  email: user.email,
  name: user.name,
  role: user.role,
  status: user.status,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
  avatar: user.avatar || '',
});

export const usersAPI = {
  getProfile: async () => {
    const response = await axiosInstance.get<UserApiResponse>('/users/me');
    return mapUser(response.data.data);
  },

  updateProfile: async (data: { name: string; avatar?: string }) => {
    const response = await axiosInstance.put<UserApiResponse>('/users/me', data);
    return mapUser(response.data.data);
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    const response = await axiosInstance.put<ChangePasswordResponse>('/users/password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};
