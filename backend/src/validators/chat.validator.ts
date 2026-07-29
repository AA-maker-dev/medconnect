import { z } from 'zod';

export const listMessagesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(30),
    search: z.string().trim().optional(),
  }),
});
