/**
 * Normalize URL → safe relative path
 */
export function toRelativePath(url: URL): string {
  const path = url.pathname + url.search + url.hash;
  return path.startsWith('/') ? path : '/';
}
