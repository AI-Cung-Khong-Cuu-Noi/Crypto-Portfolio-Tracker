import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid portfolio id',
});

export const createPortfolioSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
    description: z
      .string()
      .max(500, 'Description must be at most 500 characters')
      .optional(),
  }),
});

export const updatePortfolioSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters').optional(),
      description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
    })
    .refine((value) => value.name !== undefined || value.description !== undefined, {
      message: 'At least one field is required',
      path: [],
    }),
});

export const portfolioIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
