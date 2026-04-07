import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResetPassword } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card } from '../../components/ui/Card';
import { Loader } from 'lucide-react';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
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
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Create New Password</h1>
          <p className='text-gray-600'>Enter the code and your new password</p>
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
            <Label htmlFor='otp'>Verification Code</Label>
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
            <Label htmlFor='newPassword'>New Password</Label>
            <Input
              id='newPassword'
              type='password'
              placeholder='••••••••'
              {...register('newPassword')}
              className='mt-1'
            />
            {errors.newPassword && <p className='text-red-600 text-sm mt-1'>{errors.newPassword.message}</p>}
          </div>

          <div>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              id='confirmPassword'
              type='password'
              placeholder='••••••••'
              {...register('confirmPassword')}
              className='mt-1'
            />
            {errors.confirmPassword && <p className='text-red-600 text-sm mt-1'>{errors.confirmPassword.message}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
            Reset Password
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <button
            onClick={() => navigate('/login')}
            className='text-blue-600 hover:text-blue-700 font-medium text-sm'
          >
            Back to sign in
          </button>
        </div>
      </div>
    </Card>
  );
}
