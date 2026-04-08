import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/admin';
import { toast } from 'sonner';
import type { User } from '../types';

export const useAdminUsers = (page: number = 1, limit: number = 10, search?: string) => {
  return useQuery({
    queryKey: ['admin', 'users', page, limit, search],
    queryFn: () => adminAPI.listUsers(page, limit, search),
  });
};

export const useAdminUserDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminAPI.getUserDetail(id!),
    enabled: !!id,
  });
};

export const useAdminUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ name: string; email: string; role: 'USER' | 'ADMIN'; status: User['status'] }>;
    }) => adminAPI.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
      toast.success('Cập nhật người dùng thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật người dùng thất bại');
    },
  });
};

export const useAdminDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Đã xóa người dùng (xóa mềm)');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Xóa người dùng thất bại');
    },
  });
};

export const useAdminResetPassword = () => {
  return useMutation({
    mutationFn: (id: string) => adminAPI.resetUserPassword(id),
    onSuccess: (data) => {
      toast.success(`${data.message} Mật khẩu mới: ${data.newPassword}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    },
  });
};

export const useAdminUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: User['status'] }) =>
      adminAPI.updateUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
      toast.success('Cập nhật trạng thái thành công');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Cập nhật trạng thái thất bại');
    },
  });
};
