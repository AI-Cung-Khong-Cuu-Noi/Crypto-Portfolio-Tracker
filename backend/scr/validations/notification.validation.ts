import mongoose from 'mongoose';
import { z } from 'zod';

const objectIdSchema = z.string().refine((value) => mongoose.Types.ObjectId.isValid(value), {
  message: 'Invalid id',
});

export const listNotificationsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    unreadOnly: z.enum(['true', 'false']).optional(),
  }),
});

export const notificationIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});
