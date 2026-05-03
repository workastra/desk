import { dayjs } from '@internal/base/date';
import { z } from 'zod';

/**
 * Base schema for canonical v1 responses.
 */
export const CanonicalBaseSchema = z.strictObject({
  protocol: z.string(),
  code: z.string(),
  message: z.string(),
  meta: z.object({
    timestamp: z
      .string()
      .default(() => dayjs().utc().toISOString())
      .exactOptional(),
  }),
});
