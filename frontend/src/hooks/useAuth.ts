import { useMutation } from '@tanstack/react-query';
import { authAPI } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      authAPI.register(data.email, data.password, data.name),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      authAPI.login(data.email, data.password),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(data.message || 'Login successful');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      authAPI.verifyOTP(data.email, data.otp),
    onSuccess: (data) => {
      toast.success(data.message || 'OTP verified successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    },
  });
};

export const useResendOTP = () => {
  return useMutation({
    mutationFn: (email: string) => authAPI.resendOTP(email),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authAPI.forgotPassword(email),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: { email: string; otp: string; newPassword: string }) =>
      authAPI.resetPassword(data.email, data.otp, data.newPassword),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Password reset failed');
    },
  });
};
