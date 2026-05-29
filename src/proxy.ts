import { NextRequest, NextResponse } from 'next/server';
import { UnauthenticationError } from '@internal/base/exception/UnauthenticationError';
import { getSessionManager } from '@internal/base/session';
import {
  createOIDCClient,
  fetchUserProfile,
  resolveOIDCClientConfiguration,
} from '@internal/core/features/authentication/server';
import { AuthenticationSessionSchema } from '@internal/core/features/authentication/shared';
import { OperationProcessingError, WWWAuthenticateChallengeError } from 'oauth4webapi';

const protectedRoutes = ['/workspace'];
const authRoutes = ['/login', '/signup'];

/**
 * Normalizes a pathname by removing a trailing slash (except root `/`).
 */
const normalizePathname = (pathname: string) => {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
};

/**
 * Returns true when `pathname` exactly matches a route or is a child of that route.
 */
const matchesRoute = (pathname: string, routes: string[]) => {
  const normalizedPathname = normalizePathname(pathname);

  return routes.some((route) => {
    const normalizedRoute = normalizePathname(route);
    return (
      normalizedPathname === normalizedRoute || normalizedPathname.startsWith(`${normalizedRoute}/`)
    );
  });
};

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
  const isAuthRoute = matchesRoute(pathname, authRoutes);

  let isAuthenticated = false;

  try {
    const client = createOIDCClient(resolveOIDCClientConfiguration());
    await fetchUserProfile(client);
    isAuthenticated = true;
  } catch (error) {
    if (
      error instanceof WWWAuthenticateChallengeError ||
      error instanceof UnauthenticationError ||
      error instanceof OperationProcessingError
    ) {
      isAuthenticated = false;
    } else {
      throw error;
    }
  }

  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  if (!isAuthenticated) {
    // Destroy session if the session is exists but invalid (e.g., expired, revoked, etc.) to prevent infinite redirect loop
    const sessionManager = getSessionManager(AuthenticationSessionSchema);

    if (await sessionManager.exists()) {
      await sessionManager.destroy();
    }

    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/api/oidc/login', request.nextUrl));
    }
  }

  return NextResponse.next();
}

// Routes Proxy should not run on
export const config = {
  matcher: `/((?!api|_next/static|_next/image|.*\.png$).*)`,
};
