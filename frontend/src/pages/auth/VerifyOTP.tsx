import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVerifyOTP, useResendOTP } from '../../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card } from '../../components/ui/Card';
import { Loader } from 'lucide-react';

const verifyOTPSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otp: z.string().length(6, 'Mã OTP phải gồm 6 chữ số'),
});

type VerifyOTPForm = z.infer<typeof verifyOTPSchema>;

export default function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const [countdown, setCountdown] = useState(0);
  const email = location.state?.email || '';

  const { mutate: verifyOTP, isPending: isVerifying } = useVerifyOTP();
  const { mutate: resendOTP, isPending: isResending } = useResendOTP();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOTPForm>({
    resolver: zodResolver(verifyOTPSchema),
    defaultValues: { email },
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onSubmit = (data: VerifyOTPForm) => {
    verifyOTP(data, {
      onSuccess: () => {
        navigate('/login');
      },
    });
  };

  const handleResendOTP = () => {
    resendOTP(email, {
      onSuccess: () => {
        setCountdown(60);
      },
    });
  };

  return (
    <Card className='border-0 shadow-lg'>
      <div className='p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Xác thực email</h1>
          <p className='text-gray-600'>Nhập mã 6 chữ số đã gửi tới {email}</p>
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
            {errors.email && <p className='text-red-600 text-sm mt-1'>{errors.email.message}</p>}
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

          <Button type='submit' className='w-full' disabled={isVerifying}>
            {isVerifying ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
            Xác thực
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 mb-2'>Không nhận được mã?</p>
          <Button
            type='button'
            onClick={handleResendOTP}
            disabled={countdown > 0 || isResending}
            className='w-full'
            variant='outline'
          >
            {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại OTP'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
