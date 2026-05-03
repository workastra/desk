import { createEnv } from '@t3-oss/env-nextjs';
import z from 'zod';

type ClientEnvironment = ReturnType<typeof createClientEnvironments>;

declare global {
  var __CLIENT_ENVIRONMENTS__: ClientEnvironment | undefined;
}

function createClientEnvironments() {
  return createEnv({
    client: {
      NEXT_PUBLIC_APP_VERSION: z.string(),
    },
    runtimeEnv: {
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
    },
  });
}

/**
 * Parse public env exactly once per runtime, cache on globalThis, and expose a readonly snapshot.
 *
 * Why this shape:
 * - Re-use: avoids repeating schema parsing during module reloads and repeated access.
 * - Consistency: every caller reads the same validated public env snapshot.
 * - Safety in tests/HMR: `globalThis` survives module reloads while preserving one source of truth.
 * - Compile-time immutability: callers get readonly types, so accidental mutation is rejected by TypeScript.
 */
export function getClientEnvironments(): ClientEnvironment {
  globalThis.__CLIENT_ENVIRONMENTS__ ??= createClientEnvironments();
  return globalThis.__CLIENT_ENVIRONMENTS__;
}

export function getClientEnvironment<TName extends keyof ClientEnvironment>(
  name: TName,
): ClientEnvironment[TName] {
  return getClientEnvironments()[name];
}
