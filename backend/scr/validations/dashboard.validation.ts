import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid portfolio id',
});

export const dashboardQuerySchema = z.object({
  query: z.object({
    portfolioId: objectIdSchema.optional(),
  }),
});

export const dashboardPerformanceQuerySchema = z.object({
  query: z.object({
    portfolioId: objectIdSchema.optional(),
    days: z.coerce.number().int().min(1).max(365).optional(),
  }),
});

export const dashboardTrendQuerySchema = z.object({
  query: z.object({
    perPage: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
