import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid portfolio id',
});

const reportQueryBase = z.object({
  portfolioId: objectIdSchema.optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const reportsSummaryQuerySchema = z.object({
  query: reportQueryBase.extend({
    granularity: z.enum(['day', 'month', 'year']).optional(),
  }),
});

export const reportsTaxQuerySchema = z.object({
  query: reportQueryBase,
});

export const reportsByCoinQuerySchema = z.object({
  query: reportQueryBase.extend({
    includeMarket: z.enum(['true', 'false']).optional(),
  }),
});
