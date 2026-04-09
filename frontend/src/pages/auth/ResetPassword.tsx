import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPassword } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card } from '../../components/ui/Card';
import { Eye, EyeOff, Loader } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

const resetPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otp: z.string().length(6, 'Mã OTP phải gồm 6 chữ số'),
  newPassword: z
    .string()
    .regex(
      PASSWORD_REGEX,
      'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    resetPassword(
      {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          navigate('/login');
        },
      }
    );
  };

  return (
    <Card className='border-0 shadow-lg'>
      <div className='p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Đặt lại mật khẩu</h1>
          <p className='text-gray-600'>Nhập mã OTP và mật khẩu mới của bạn</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              {...register('email')}
              className='mt-1'
              disabled
            />
          </div>

          <div>
            <Label htmlFor='otp'>Mã xác thực</Label>
            <Input
              id='otp'
              placeholder='000000'
              {...register('otp')}
              className='mt-1 font-mono text-center tracking-widest'
              maxLength={6}
            />
            {errors.otp && <p className='text-red-600 text-sm mt-1'>{errors.otp.message}</p>}
          </div>

          <div>
            <Label htmlFor='newPassword'>Mật khẩu mới</Label>
            <div className='relative mt-1'>
              <Input
                id='newPassword'
                type={showNewPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...register('newPassword')}
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowNewPassword((prev) => !prev)}
                className='absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700'
                aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.newPassword && <p className='text-red-600 text-sm mt-1'>{errors.newPassword.message}</p>}
          </div>

          <div>
            <Label htmlFor='confirmPassword'>Xác nhận mật khẩu</Label>
            <div className='relative mt-1'>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...register('confirmPassword')}
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className='absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700'
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className='text-red-600 text-sm mt-1'>{errors.confirmPassword.message}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
            Đặt lại mật khẩu
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <button
            onClick={() => navigate('/login')}
            className='text-blue-600 hover:text-blue-700 font-medium text-sm'
          >
            Quay lại đăng nhập
          </button>
        </div>
      </div>
    </Card>
  );
}
