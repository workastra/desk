import z from 'zod';

export const AuthenticationSessionSchema = z.object({
  idToken: z.strictObject({
    raw: z.string().nonempty(),
    claims: z.strictObject({
      sub: z.string().nonempty(),
    }),
  }),
  accessToken: z.string().nonempty(),
  refreshToken: z.string().nonempty(),
});
