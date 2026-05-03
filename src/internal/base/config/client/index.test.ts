import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

describe('internal/base/config/client', () => {
  beforeEach(() => {
    globalThis.__CLIENT_ENVIRONMENTS__ = undefined;
    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '1.2.3');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns public configuration through both client accessors', async () => {
    const { getClientEnvironment, getClientEnvironments } = await import('./index');

    expect(getClientEnvironment('NEXT_PUBLIC_APP_VERSION')).toBe('1.2.3');
    expect(getClientEnvironments().NEXT_PUBLIC_APP_VERSION).toBe('1.2.3');
  });

  it('captures public configuration when first read through the public accessors', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '2.0.0');

    const { getClientEnvironment, getClientEnvironments } = await import('./index');

    expect(getClientEnvironment('NEXT_PUBLIC_APP_VERSION')).toBe('2.0.0');
    expect(getClientEnvironments().NEXT_PUBLIC_APP_VERSION).toBe('2.0.0');

    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '9.9.9');

    expect(getClientEnvironment('NEXT_PUBLIC_APP_VERSION')).toBe('2.0.0');
    expect(getClientEnvironments().NEXT_PUBLIC_APP_VERSION).toBe('2.0.0');
  });

  it('reuses one global cached client configuration object', async () => {
    const { getClientEnvironments } = await import('./index');

    const first = getClientEnvironments();
    const second = getClientEnvironments();

    expect(first).toBe(second);
  });

  it('exposes readonly client configuration types', async () => {
    const { getClientEnvironment, getClientEnvironments } = await import('./index');

    expectTypeOf(getClientEnvironments()).toEqualTypeOf<
      Readonly<ReturnType<typeof getClientEnvironments>>
    >();
    expectTypeOf(getClientEnvironment('NEXT_PUBLIC_APP_VERSION')).toEqualTypeOf<string>();
  });

  it('reuses the cached client configuration across module reloads for HMR', async () => {
    const firstModule = await import('./index');
    const first = firstModule.getClientEnvironments();

    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '9.9.9');
    vi.resetModules();

    const secondModule = await import('./index');
    const second = secondModule.getClientEnvironments();

    expect(second).toBe(first);
    expect(second.NEXT_PUBLIC_APP_VERSION).toBe('1.2.3');
  });

  it('rejects missing required public configuration', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- Explicitly passing undefined to clear the env var
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', undefined);

    const { getClientEnvironments } = await import('./index');

    expect(() => getClientEnvironments()).toThrowError();
  });
});
