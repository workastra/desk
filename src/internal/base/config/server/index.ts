import 'server-only';
import { createEnv } from '@t3-oss/env-nextjs';
import { isString } from 'es-toolkit';
import z from 'zod';

type ServerEnvironment = ReturnType<typeof createServerEnvironments>;

declare global {
  var __SERVER_ENVIRONMENTS__: ServerEnvironment | undefined;
}

function createServerEnvironments() {
  return createEnv({
    emptyStringAsUndefined: true,
    server: {
      IS_PRODUCTION: z.boolean(),
      IS_DEVELOPMENT: z.boolean(),
      IS_TEST: z.boolean(),
      APP_URL: z.url().transform((value) => new URL(value)),
      APP_KEY: z.string().nonempty(),
      APP_PREVIOUS_KEYS: z
        .string()
        .optional()
        .transform<string[]>((value) => {
          if (!isString(value) || value.length === 0) {
            return [];
          }

          return value
            .split(/[\r\n,]+/)
            .map((key) => key.trim())
            .filter(Boolean);
        }),
      IAM_EXTERNAL_ISSUER_URL: z.url().transform((value) => new URL(value)),
      IAM_INTERNAL_ISSUER_URL: z.url().transform((value) => new URL(value)),
      IAM_TLS_SKIP_VERIFY: z.stringbool().default(false),
      IAM_OAUTH_CLIENT_ID: z.string().nonempty(),
      IAM_OAUTH_CLIENT_SECRET: z.string().nonempty(),
      LOCK_MODE: z.enum(['in-memory', 'distributed']).default('in-memory'),
    },
    runtimeEnv: {
      IS_PRODUCTION: process.env.NODE_ENV === 'production',
      IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
      IS_TEST: process.env.NODE_ENV === 'test',
      APP_URL: process.env.APP_URL,
      IAM_EXTERNAL_ISSUER_URL: process.env.IAM_EXTERNAL_ISSUER_URL,
      IAM_INTERNAL_ISSUER_URL: process.env.IAM_INTERNAL_ISSUER_URL,
      IAM_TLS_SKIP_VERIFY: process.env.IAM_TLS_SKIP_VERIFY,
      IAM_OAUTH_CLIENT_ID: process.env.IAM_OAUTH_CLIENT_ID,
      APP_KEY: process.env.APP_KEY,
      APP_PREVIOUS_KEYS: process.env.APP_PREVIOUS_KEYS,
      IAM_OAUTH_CLIENT_SECRET: process.env.IAM_OAUTH_CLIENT_SECRET,
      LOCK_MODE: process.env.LOCK_MODE,
    },
  });
}

/**
 * Parse server env exactly once per runtime, cache on globalThis, and expose a readonly snapshot.
 *
 * Why this shape:
 * - Re-use: avoids repeated schema parsing in paths that call this helper many times.
 * - Consistency: every caller reads the same validated snapshot of startup env.
 * - Safety in tests/HMR: `globalThis` survives module reloads while preserving one source of truth.
 * - Compile-time immutability: callers get readonly types, so accidental mutation is rejected by TypeScript.
 */
export function getServerEnvironments(): ServerEnvironment {
  globalThis.__SERVER_ENVIRONMENTS__ ??= createServerEnvironments();
  return globalThis.__SERVER_ENVIRONMENTS__;
}

export function getServerEnvironment<TName extends keyof ServerEnvironment>(
  name: TName,
): ServerEnvironment[TName] {
  const serverEnvironments = getServerEnvironments();
  return serverEnvironments[name];
}
