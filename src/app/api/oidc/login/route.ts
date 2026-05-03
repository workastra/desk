import { NextRequest } from 'next/server';
import { getSessionManager } from '@internal/base/session';
import {
  createOIDCClient,
  prepareOIDCLoginRedirect,
  resolveOIDCClientConfiguration,
  resolveSafeReturnTo,
  rewriteAuthorizationURLToExternalIssuerOrigin,
} from '@internal/core/features/authentication/server';
import {
  AuthenticationSessionSchema,
  OAuthPkceStateCookie,
} from '@internal/core/features/authentication/shared';
import { StatusCodes } from 'http-status-codes';

export async function GET(request: NextRequest) {
  const sessionManager = getSessionManager(AuthenticationSessionSchema);

  if (await sessionManager.exists()) {
    return Response.redirect(new URL('/', request.url), StatusCodes.SEE_OTHER);
  }

  const client = createOIDCClient(resolveOIDCClientConfiguration());
  const { redirectURL, credentials } = await prepareOIDCLoginRedirect(client);

  const oauthPkceStateCookie = OAuthPkceStateCookie();
  await oauthPkceStateCookie.push({
    codeVerifier: credentials.codeVerifier,
    state: credentials.state,
    nonce: credentials.nonce,
    returnTo: resolveSafeReturnTo(request.nextUrl.searchParams.get('returnTo'), {
      blockedPaths: [`${request.nextUrl.pathname}**`],
    }),
  });

  return Response.redirect(
    rewriteAuthorizationURLToExternalIssuerOrigin(redirectURL),
    StatusCodes.MOVED_TEMPORARILY,
  );
}
