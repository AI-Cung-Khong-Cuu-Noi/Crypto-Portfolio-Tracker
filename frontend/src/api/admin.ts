import axiosInstance from './axios';
import { User } from '../types';

type AdminUserPayload = {
  _id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'BANNED';
  avatar?: string;
  created_at: string;
  updated_at: string;
};

type ApiListResponse = {
  success: boolean;
  data: AdminUserPayload[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
};

type ApiUserResponse = {
  success: boolean;
  message?: string;
  data: AdminUserPayload;
};

type ApiMessageResponse = {
  success: boolean;
  message: string;
};

interface PaginatedUsers {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const mapUser = (u: AdminUserPayload): User => ({
  id: u._id,
  email: u.email,
  name: u.name,
  role: u.role,
  status: u.status,
  createdAt: u.created_at,
  updatedAt: u.updated_at,
  avatar: u.avatar || '',
});

/** Mật khẩu đủ điều kiện validation backend (hoa, thường, số, ký tự đặc biệt, ≥8) */
function generateSecureTemporaryPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%&*';
  const all = upper + lower + digits + special;
  const randomChar = (s: string) => {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return s[arr[0] % s.length];
  };
  const chars = [randomChar(upper), randomChar(lower), randomChar(digits), randomChar(special)];
  for (let i = 0; i < 8; i++) chars.push(randomChar(all));
  for (let i = chars.length - 1; i > 0; i--) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    const j = arr[0] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export const adminAPI = {
  listUsers: async (page: number = 1, limit: number = 10, search?: string): Promise<PaginatedUsers> => {
    const params: Record<string, string | number> = { page, limit };
    const q = search?.trim();
    if (q) {
      if (q.includes('@')) {
        params.email = q;
      } else {
        params.name = q;
      }
    }
    const response = await axiosInstance.get<ApiListResponse>('/admin/users', { params });
    return {
      data: response.data.data.map(mapUser),
      pagination: {
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
      },
    };
  },

  getUserDetail: async (id: string): Promise<User> => {
    const response = await axiosInstance.get<ApiUserResponse>(`/admin/users/${id}`);
    return mapUser(response.data.data);
  },

  updateUser: async (
    id: string,
    data: Partial<{ name: string; email: string; role: 'USER' | 'ADMIN'; status: User['status'] }>
  ): Promise<User> => {
    const response = await axiosInstance.put<ApiUserResponse>(`/admin/users/${id}`, data);
    return mapUser(response.data.data);
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<ApiMessageResponse>(`/admin/users/${id}`);
    return { message: response.data.message };
  },

  resetUserPassword: async (id: string): Promise<{ message: string; newPassword: string }> => {
    const newPassword = generateSecureTemporaryPassword();
    const response = await axiosInstance.post<ApiMessageResponse>(`/admin/users/${id}/reset-password`, {
      newPassword,
    });
    return { message: response.data.message, newPassword };
  },

  updateUserStatus: async (id: string, status: User['status']): Promise<User> => {
    const response = await axiosInstance.patch<ApiUserResponse>(`/admin/users/${id}/status`, { status });
    return mapUser(response.data.data);
  },
};
