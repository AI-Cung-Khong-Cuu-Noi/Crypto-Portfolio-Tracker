import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card } from '../../components/ui/Card';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { toast } from 'sonner';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

const registerSchema = z.object({
  name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và ký tự đặc biệt'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate: register, isPending } = useRegister();
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterForm) => {
    register({
      name: data.name,
      email: data.email,
      password: data.password,
    }, {
      onSuccess: () => {
        toast.success('Vui lòng kiểm tra email để lấy mã OTP xác thực');
        navigate('/verify-otp', { state: { email: data.email } });
      },
    });
  };

  return (
    <Card className='border-0 shadow-lg'>
      <div className='p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Tạo tài khoản</h1>
          <p className='text-gray-600'>Bắt đầu quản lý danh mục crypto của bạn</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='name'>Họ và tên</Label>
            <Input
              id='name'
              placeholder='Nguyen Van A'
              {...registerField('name')}
              className='mt-1'
            />
            {errors.name && <p className='text-red-600 text-sm mt-1'>{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='ban@example.com'
              {...registerField('email')}
              className='mt-1'
            />
            {errors.email && <p className='text-red-600 text-sm mt-1'>{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor='password'>Mật khẩu</Label>
            <div className='relative mt-1'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...registerField('password')}
                className='pr-10'
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

          <div>
            <Label htmlFor='confirmPassword'>Xác nhận mật khẩu</Label>
            <div className='relative mt-1'>
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...registerField('confirmPassword')}
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
            Tạo tài khoản
          </Button>
        </form>

        <div className='mt-6 text-center text-sm'>
          <span className='text-gray-600'>Đã có tài khoản? </span>
          <button
            onClick={() => navigate('/login')}
            className='text-blue-600 hover:text-blue-700 font-medium'
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </Card>
  );
}
