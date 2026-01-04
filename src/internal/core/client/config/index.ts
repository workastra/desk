import z from 'zod';

const PublicEnvironmentSchema = z
  .object({
    IS_PRODUCTION: z.boolean(),
    IS_DEVELOPMENT: z.boolean(),
    IS_TEST: z.boolean(),
    NEXT_PUBLIC_BASE_URL: z.url(),
  })
  .readonly();

export const PublicEnvironment = await PublicEnvironmentSchema.parseAsync({
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_TEST: process.env.NODE_ENV === 'test',
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
});
