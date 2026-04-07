import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card } from '../../components/ui/Card';
import { Loader } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { mutate: login, isPending } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginForm) => {
    login(data, {
      onSuccess: () => {
        navigate('/');
      },
    });
  };

  return (
    <Card className='border-0 shadow-lg'>
      <div className='p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Welcome Back</h1>
          <p className='text-gray-600'>Sign in to your crypto portfolio</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='you@example.com'
              {...register('email')}
              className='mt-1'
            />
            {errors.email && <p className='text-red-600 text-sm mt-1'>{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              {...register('password')}
              className='mt-1'
            />
            {errors.password && <p className='text-red-600 text-sm mt-1'>{errors.password.message}</p>}
          </div>

          <div className='flex items-center justify-between text-sm'>
            <label className='flex items-center gap-2 cursor-pointer'>
              
            </label>
            <button
              type='button'
              onClick={() => navigate('/forgot-password')}
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Forgot password?
            </button>
          </div>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
            Sign in
          </Button>
        </form>

        <div className='mt-6 text-center text-sm'>
          <span className='text-gray-600'>Don't have an account? </span>
          <button
            onClick={() => navigate('/register')}
            className='text-blue-600 hover:text-blue-700 font-medium'
          >
            Create one
          </button>
        </div>
      </div>
    </Card>
  );
}
