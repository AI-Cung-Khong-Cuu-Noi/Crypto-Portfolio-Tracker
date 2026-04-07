import { z } from 'zod';

const passwordSchema = z
  .string()
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  );

export const adminGetUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    email: z.string().trim().optional(),
    name: z.string().trim().optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
    status: z.enum(['PENDING', 'ACTIVE', 'BANNED']).optional(),
  }),
});

export const adminUserIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User id is required'),
  }),
});

export const adminUpdateUserSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User id is required'),
  }),
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      email: z.string().email('Email is invalid').optional(),
      role: z.enum(['USER', 'ADMIN']).optional(),
      status: z.enum(['PENDING', 'ACTIVE', 'BANNED']).optional(),
    })
    .refine((val) => Object.keys(val).length > 0, {
      message: 'At least one field is required',
    }),
});

export const adminResetPasswordSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User id is required'),
  }),
  body: z.object({
    newPassword: passwordSchema,
  }),
});

export const adminUpdateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'User id is required'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'ACTIVE', 'BANNED']),
  }),
});
