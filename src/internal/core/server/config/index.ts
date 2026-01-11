import 'server-only';
import z from 'zod';

const PrivateEnvironmentSchema = z
  .object({
    SECRET: z.string(),

    IAM_ISSUER_URL: z.url(),
    IAM_TLS_SKIP_VERIFY: z.stringbool().default(false),
    IAM_OAUTH_CLIENT_ID: z.string(),
  })
  .readonly();

export const PrivateEnvironment = await PrivateEnvironmentSchema.parseAsync({
  SECRET: process.env.SECRET,

  IAM_ISSUER_URL: process.env.IAM_ISSUER_URL,
  IAM_TLS_SKIP_VERIFY: process.env.IAM_TLS_SKIP_VERIFY,
  IAM_OAUTH_CLIENT_ID: process.env.IAM_OAUTH_CLIENT_ID,
});
