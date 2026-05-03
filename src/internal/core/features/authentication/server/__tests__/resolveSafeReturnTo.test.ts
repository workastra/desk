import { describe, expect, it } from 'vitest';
import { resolveSafeReturnTo } from '../resolveSafeReturnTo';

describe('resolveSafeReturnTo', () => {
  it('returns normalized relative path for relative input', () => {
    expect(resolveSafeReturnTo('/projects?tab=active#current')).toBe(
      '/projects?tab=active#current',
    );
  });

  it('strips origin from absolute input', () => {
    expect(resolveSafeReturnTo('https://example.com/settings?mode=full')).toBe(
      '/settings?mode=full',
    );
  });

  it('falls back when input is malformed', () => {
    expect(resolveSafeReturnTo('http://[invalid-host', { fallback: '/home' })).toBe('/home');
  });

  it('falls back when pathname matches a blocked pattern', () => {
    expect(
      resolveSafeReturnTo('/api/oidc/login?returnTo=/x', { blockedPaths: ['/api/oidc/**'] }),
    ).toBe('/');
  });
});
