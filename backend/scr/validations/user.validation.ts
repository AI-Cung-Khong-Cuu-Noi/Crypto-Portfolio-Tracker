import { z } from 'zod';

const passwordSchema = z
  .string()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  );

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: passwordSchema,
  }),
});

export const adminUpdateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'ACTIVE', 'BANNED']),
  }),
});
