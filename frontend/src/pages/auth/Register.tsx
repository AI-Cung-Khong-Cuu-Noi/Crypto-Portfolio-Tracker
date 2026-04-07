import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card } from '../../components/ui/Card';
import { Loader } from 'lucide-react';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
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
        toast.success('Check your email for the OTP verification code');
        navigate('/verify-otp', { state: { email: data.email } });
      },
    });
  };

  return (
    <Card className='border-0 shadow-lg'>
      <div className='p-8'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>Create Account</h1>
          <p className='text-gray-600'>Start managing your crypto portfolio</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              placeholder='John Doe'
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
              placeholder='you@example.com'
              {...registerField('email')}
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
              {...registerField('password')}
              className='mt-1'
            />
            {errors.password && <p className='text-red-600 text-sm mt-1'>{errors.password.message}</p>}
          </div>

          <div>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              id='confirmPassword'
              type='password'
              placeholder='••••••••'
              {...registerField('confirmPassword')}
              className='mt-1'
            />
            {errors.confirmPassword && <p className='text-red-600 text-sm mt-1'>{errors.confirmPassword.message}</p>}
          </div>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? <Loader className='mr-2 h-4 w-4 animate-spin' /> : null}
            Create Account
          </Button>
        </form>

        <div className='mt-6 text-center text-sm'>
          <span className='text-gray-600'>Already have an account? </span>
          <button
            onClick={() => navigate('/login')}
            className='text-blue-600 hover:text-blue-700 font-medium'
          >
            Sign in
          </button>
        </div>
      </div>
    </Card>
  );
}
