import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

const alertKind = z.enum([
  'PRICE_ABOVE',
  'PRICE_BELOW',
  'CHANGE_24H_ABOVE',
  'CHANGE_24H_BELOW',
]);

export const createAlertSchema = z.object({
  body: z
    .object({
      symbol: z.string().min(1).max(20),
      coinGeckoId: z.string().max(80).optional(),
      kind: alertKind,
      threshold: z.number().nonnegative(),
      isActive: z.boolean().optional(),
      cooldownMinutes: z.number().int().min(1).max(10080).optional(),
    })
    .superRefine((data, ctx) => {
      if (
        (data.kind === 'PRICE_ABOVE' || data.kind === 'PRICE_BELOW') &&
        data.threshold === 0
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'threshold must be positive for price alerts',
          path: ['threshold'],
        });
      }
      if (
        (data.kind === 'CHANGE_24H_ABOVE' || data.kind === 'CHANGE_24H_BELOW') &&
        data.threshold === 0
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'threshold must be positive for change alerts (percent)',
          path: ['threshold'],
        });
      }
    }),
});

export const updateAlertSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      kind: alertKind.optional(),
      threshold: z.number().nonnegative().optional(),
      isActive: z.boolean().optional(),
      cooldownMinutes: z.number().int().min(1).max(10080).optional(),
      coinGeckoId: z.string().max(80).optional(),
      symbol: z.string().min(1).max(20).optional(),
    })
    .refine((b) => Object.keys(b).length > 0, { message: 'At least one field is required' }),
});

export const alertIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
