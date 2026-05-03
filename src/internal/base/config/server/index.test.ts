// @vitest-environment node
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

function stubRequiredServerEnvironments() {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('APP_URL', 'https://app.example.com');
  vi.stubEnv('IAM_EXTERNAL_ISSUER_URL', 'https://iam.external.example.com');
  vi.stubEnv('IAM_INTERNAL_ISSUER_URL', 'https://iam.internal.example.com');
  vi.stubEnv('IAM_OAUTH_CLIENT_ID', 'client-id');
  vi.stubEnv('APP_KEY', 'app-key');
  vi.stubEnv('APP_PREVIOUS_KEYS', 'old-key-1\n\nold-key-2\n');
  vi.stubEnv('IAM_OAUTH_CLIENT_SECRET', 'oauth-secret');
}

describe('internal/base/config/server', () => {
  beforeEach(() => {
    globalThis.__SERVER_ENVIRONMENTS__ = undefined;
    vi.resetModules();
    vi.clearAllMocks();
    stubRequiredServerEnvironments();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns parsed server configuration through both public accessors', async () => {
    vi.stubEnv('IAM_TLS_SKIP_VERIFY', 'true');
    vi.stubEnv('LOCK_MODE', 'distributed');

    const { getServerEnvironment, getServerEnvironments } = await import('./index');

    expect(getServerEnvironment('APP_KEY')).toBe('app-key');
    expect(getServerEnvironments().APP_KEY).toBe('app-key');
    expect(getServerEnvironment('IS_PRODUCTION')).toBe(true);
    expect(getServerEnvironment('IS_DEVELOPMENT')).toBe(false);
    expect(getServerEnvironment('APP_URL')).toBeInstanceOf(URL);
    expect(getServerEnvironment('APP_URL').href).toBe('https://app.example.com/');
    expect(getServerEnvironment('APP_PREVIOUS_KEYS')).toEqual(['old-key-1', 'old-key-2']);
    expect(getServerEnvironment('IAM_OAUTH_CLIENT_SECRET')).toBe('oauth-secret');
    expect(getServerEnvironment('IAM_TLS_SKIP_VERIFY')).toBe(true);
    expect(getServerEnvironment('LOCK_MODE')).toBe('distributed');
  });

  it('applies defaults when optional server settings are not provided', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('IAM_TLS_SKIP_VERIFY', 'false');
    vi.stubEnv('APP_PREVIOUS_KEYS', '');

    const { getServerEnvironment } = await import('./index');

    expect(getServerEnvironment('IS_TEST')).toBe(true);
    expect(getServerEnvironment('IAM_TLS_SKIP_VERIFY')).toBe(false);
    expect(getServerEnvironment('LOCK_MODE')).toBe('in-memory');
    expect(getServerEnvironment('APP_PREVIOUS_KEYS')).toEqual([]);
  });

  it('captures server configuration at module initialization', async () => {
    const { getServerEnvironment, getServerEnvironments } = await import('./index');

    expect(getServerEnvironment('APP_URL').href).toBe('https://app.example.com/');

    vi.stubEnv('APP_URL', 'https://mutated.example.com');

    expect(getServerEnvironment('APP_URL').href).toBe('https://app.example.com/');
    expect(getServerEnvironments().APP_URL.href).toBe('https://app.example.com/');
  });

  it('reuses one global cached server configuration object', async () => {
    const { getServerEnvironments } = await import('./index');

    const first = getServerEnvironments();
    const second = getServerEnvironments();

    expect(first).toBe(second);
  });

  it('exposes readonly server configuration types', async () => {
    const { getServerEnvironment, getServerEnvironments } = await import('./index');

    expectTypeOf(getServerEnvironments()).toEqualTypeOf<
      Readonly<ReturnType<typeof getServerEnvironments>>
    >();
    expectTypeOf(getServerEnvironment('APP_PREVIOUS_KEYS')).toEqualTypeOf<string[]>();
  });

  it('reuses the cached server configuration across module reloads for HMR', async () => {
    const firstModule = await import('./index');
    const first = firstModule.getServerEnvironments();

    vi.stubEnv('APP_URL', 'https://hmr-mutated.example.com');
    vi.resetModules();

    const secondModule = await import('./index');
    const second = secondModule.getServerEnvironments();

    expect(second).toBe(first);
    expect(second.APP_URL.href).toBe('https://app.example.com/');
  });

  it('rejects missing required secret configuration when server config is read', async () => {
    vi.stubEnv('APP_KEY', '');

    const { getServerEnvironment } = await import('./index');

    expect(() => getServerEnvironment('APP_KEY')).toThrowError();
  });
});
