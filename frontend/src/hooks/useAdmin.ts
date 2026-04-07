import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../api/admin';
import { toast } from 'sonner';

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
    mutationFn: ({ id, data }: { id: string; data: { name: string; email: string; role: 'USER' | 'ADMIN' } }) =>
      adminAPI.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });
};

export const useAdminDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });
};

export const useAdminResetPassword = () => {
  return useMutation({
    mutationFn: (id: string) => adminAPI.resetUserPassword(id),
    onSuccess: (data) => {
      toast.success(`Password reset. Temporary password: ${data.temporaryPassword}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });
};

export const useAdminUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      adminAPI.updateUserStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
      toast.success('User status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    },
  });
};
