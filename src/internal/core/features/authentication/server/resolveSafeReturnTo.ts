import { toRelativePath } from '@internal/base/url';
import { minimatch } from 'minimatch';

type ResolveSafeReturnToOptions = {
  fallback?: string;
  blockedPaths?: string[];
};

/**
 * Normalizes any return target to a safe, relative path.
 */
export function resolveSafeReturnTo(
  raw: string | null,
  options: ResolveSafeReturnToOptions = {},
): string {
  const { fallback = '/', blockedPaths = [] } = options;

  try {
    const url = new URL(raw ?? fallback, 'http://localhost');
    const path = toRelativePath(url);

    const isBlocked = blockedPaths.some((pattern) => minimatch(url.pathname, pattern));
    return isBlocked ? fallback : path;
  } catch {
    return fallback;
  }
}
