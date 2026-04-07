import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

export const createWatchlistItemSchema = z.object({
  body: z.object({
    symbol: z.string().min(1).max(20),
    coinGeckoId: z.string().max(80).optional(),
  }),
});

export const watchlistItemIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
