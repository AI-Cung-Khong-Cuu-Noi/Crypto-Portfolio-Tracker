import { useForm } from 'react-hook-form';
import { useLogin } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card } from '../../components/ui/Card';
import { Eye, EyeOff, Loader, Lock, Mail } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type LoginForm = {
  email: string;
  password: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    mode: 'onBlur',
  });

  const onSubmit = (data: LoginForm) => {
    login(data, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  return (
    <Card className='border-0 shadow-2xl overflow-hidden'>
      <div className='relative p-8'>
        <div className='absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500' />

        <div className='text-center mb-8 mt-2'>
          <div className='w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center'>
            <Lock className='text-indigo-600' size={24} />
          </div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Đăng nhập</h1>
          <p className='text-gray-600'>Chào mừng quay lại Crypto Portfolio Tracker</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <div>
            <Label htmlFor='email' className='text-gray-700'>Email</Label>
            <div className='relative mt-1.5'>
              <Mail size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <Input
                id='email'
                type='email'
                placeholder='ban@example.com'
                {...register('email', {
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: EMAIL_REGEX,
                    message: 'Email không hợp lệ',
                  },
                })}
                className='pl-10'
              />
            </div>
            {errors.email && <p className='text-red-600 text-sm mt-1'>{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor='password' className='text-gray-700'>Mật khẩu</Label>
            <div className='relative mt-1'>
              <Lock size={16} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...register('password', {
                  required: 'Vui lòng nhập mật khẩu',
                  pattern: {
                    value: PASSWORD_REGEX,
                    message:
                      'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt',
                  },
                })}
                className='pl-10 pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700'
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className='text-red-600 text-sm mt-1'>{errors.password.message}</p>}
          </div>

          <div className='flex items-center justify-end text-sm'>
            <button
              type='button'
              onClick={() => navigate('/forgot-password')}
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Quên mật khẩu?
            </button>
          </div>

          <Button type='submit' className='w-full h-11 text-base font-semibold' disabled={isPending}>
            {isPending ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
            Đăng nhập
          </Button>
        </form>

        <div className='mt-7 text-center text-sm'>
          <span className='text-gray-600'>Chưa có tài khoản? </span>
          <button
            onClick={() => navigate('/register')}
            className='text-blue-600 hover:text-blue-700 font-medium'
          >
            Tạo tài khoản
          </button>
        </div>
      </div>
    </Card>
  );
}
