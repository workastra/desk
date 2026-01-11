import { z } from 'zod';
import { dayjs } from '@internal/core/date';

/**
 * Base schema for canonical v1 responses.
 */
export const CanonicalBaseSchema = z.strictObject({
  protocol: z.string(),
  code: z.string(),
  message: z.string(),
  meta: z.object({
    timestamp: z.string().default(() => dayjs().utc().toISOString()).exactOptional(),
  }),
});
