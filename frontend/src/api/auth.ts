import axiosInstance from './axios';
import { AuthUser, LoginResponse } from '../types';

type ApiMessageResponse = {
  success: boolean;
  message: string;
};

type LoginApiResponse = {
  success: boolean;
  message: string;
  token: string;
  data: {
    userId: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    avatar?: string;
    status?: 'PENDING' | 'ACTIVE' | 'BANNED';
  };
};

const mapAuthUser = (data: LoginApiResponse['data']): AuthUser => ({
  id: data.userId,
  name: data.name,
  email: data.email,
  role: data.role,
  avatar: data.avatar || '',
  status: data.status || 'ACTIVE',
});

export const authAPI = {
  register: async (email: string, password: string, name: string) => {
    const response = await axiosInstance.post<ApiMessageResponse>('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await axiosInstance.post<LoginApiResponse>('/auth/login', {
      email,
      password,
    });
    const payload: LoginResponse = {
      token: response.data.token,
      user: mapAuthUser(response.data.data),
      message: response.data.message,
    };
    return payload;
  },

  verifyOTP: async (email: string, otp: string) => {
    const response = await axiosInstance.post<ApiMessageResponse>('/auth/verify-otp', {
      email,
      otp,
    });
    return response.data;
  },

  resendOTP: async (email: string) => {
    const response = await axiosInstance.post<ApiMessageResponse>('/auth/resend-otp', {
      email,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await axiosInstance.post<ApiMessageResponse>('/auth/forgot-password', {
      email,
    });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const response = await axiosInstance.post<ApiMessageResponse>('/auth/reset-password', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};
