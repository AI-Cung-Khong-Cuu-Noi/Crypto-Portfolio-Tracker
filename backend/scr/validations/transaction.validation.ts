import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

const transactionType = z.enum(['BUY', 'SELL', 'TRANSFER']);

const transactionBodyBase = z.object({
  portfolioId: objectIdSchema,
  type: transactionType,
  transferDirection: z.enum(['IN', 'OUT']).optional(),
  symbol: z.string().min(1, 'Symbol is required').max(20),
  coinGeckoId: z.string().max(80).optional(),
  amount: z.number().positive('Amount must be positive'),
  price: z.number().nonnegative().optional(),
  fee: z.number().nonnegative().optional(),
  totalValue: z.number().nonnegative().optional(),
  exchange: z.string().max(100).optional(),
  date: z.coerce.date(),
  note: z.string().max(500).optional(),
});

export const createTransactionSchema = z.object({
  body: transactionBodyBase.superRefine((data, ctx) => {
    if (data.type === 'TRANSFER') {
      if (!data.transferDirection) {
        ctx.addIssue({
          code: 'custom',
          message: 'transferDirection is required when type is TRANSFER',
          path: ['transferDirection'],
        });
      }
    } else if (data.transferDirection) {
      ctx.addIssue({
        code: 'custom',
        message: 'transferDirection is only allowed when type is TRANSFER',
        path: ['transferDirection'],
      });
    }

    if (data.type === 'BUY') {
      if (data.price == null && data.totalValue == null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Either price or totalValue is required for BUY',
          path: ['price'],
        });
      }
    }
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      type: transactionType.optional(),
      transferDirection: z.enum(['IN', 'OUT']).optional(),
      symbol: z.string().min(1).max(20).optional(),
      coinGeckoId: z.string().max(80).optional(),
      amount: z.number().positive().optional(),
      price: z.number().nonnegative().optional(),
      fee: z.number().nonnegative().optional(),
      totalValue: z.number().nonnegative().optional(),
      exchange: z.string().max(100).optional(),
      date: z.coerce.date().optional(),
      note: z.string().max(500).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: 'At least one field is required' }),
});

export const transactionIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listTransactionsQuerySchema = z.object({
  query: z.object({
    portfolioId: objectIdSchema.optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});
