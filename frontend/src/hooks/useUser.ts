import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../api/users';
import { toast } from 'sonner';
import { useAuthStore } from '../store/authStore';

export const useProfile = () => {
  const { user, token } = useAuthStore();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: usersAPI.getProfile,
    enabled: Boolean(user?.id && token),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  return useMutation({
    mutationFn: (data: { name: string; avatar?: string }) => usersAPI.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      updateUser({ name: updatedProfile.name, avatar: updatedProfile.avatar });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      usersAPI.changePassword(data.oldPassword, data.newPassword),
    onSuccess: (data) => {
      toast.success(data.message || 'Password changed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    },
  });
};
