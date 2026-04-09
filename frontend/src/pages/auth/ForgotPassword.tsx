import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPassword } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card } from '../../components/ui/Card';
import { Loader } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPassword(data.email, {
      onSuccess: () => {
        setSubmitted(true);
        setTimeout(() => {
          navigate('/reset-password', { state: { email: data.email } });
        }, 2000);
      },
    });
  };

  if (submitted) {
    return (
      <Card className='border-0 shadow-lg'>
        <div className='p-8 text-center'>
          <div className='w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4'>
            <span className='text-green-600 text-xl'>✓</span>
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Kiểm tra email của bạn</h1>
          <p className='text-gray-600'>Chúng tôi đã gửi mã xác thực đến {getValues('email')}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className='border-0 shadow-lg'>
      <div className='p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Quên mật khẩu</h1>
          <p className='text-gray-600'>Nhập email để nhận mã đặt lại mật khẩu</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='ban@example.com'
              {...register('email')}
              className='mt-1'
            />
            {errors.email && <p className='text-red-600 text-sm mt-1'>{errors.email.message}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
            Gửi mã đặt lại
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
