import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../api/users';
import { toast } from 'sonner';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: usersAPI.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string }) => usersAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      usersAPI.changePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};
