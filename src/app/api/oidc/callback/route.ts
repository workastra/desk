import { NextRequest } from 'next/server';
import { ErrorResponse } from '@internal/base/response/canonical/v1/ErrorResponse';
import { getSessionManager } from '@internal/base/session';
import {
  createOIDCClient,
  exchangeAuthorizationCodeForTokens,
  resolveOIDCClientConfiguration,
} from '@internal/core/features/authentication/server';
import {
  AuthenticationSessionSchema,
  ErrorCodes,
  OAuthPkceStateCookie,
} from '@internal/core/features/authentication/shared';
import { StatusCodes } from 'http-status-codes';

export async function GET(request: NextRequest) {
  const oauthPkceStateCookie = OAuthPkceStateCookie();
  const oauthPkceStateCookieValue = await oauthPkceStateCookie.consume();

  if (!oauthPkceStateCookieValue) {
    return new ErrorResponse(ErrorCodes.InvalidRequest).toHttpResponse(StatusCodes.BAD_REQUEST);
  }

  const client = createOIDCClient(resolveOIDCClientConfiguration());
  const tokens = await exchangeAuthorizationCodeForTokens(client, new URL(request.url), {
    codeVerifier: oauthPkceStateCookieValue.codeVerifier,
    expectedState: oauthPkceStateCookieValue.state,
    expectedNonce: oauthPkceStateCookieValue.nonce,
  });

  if (!tokens.id_token || !tokens.refresh_token || !tokens.expires_in) {
    return new ErrorResponse(ErrorCodes.InvalidRequest).toHttpResponse(StatusCodes.BAD_REQUEST);
  }

  const sessionManager = getSessionManager(AuthenticationSessionSchema);
  await sessionManager.replace(
    AuthenticationSessionSchema.parse({
      idToken: {
        raw: tokens.id_token,
        claims: {
          sub: tokens.claims.sub,
        },
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    }),
  );

  return Response.redirect(
    new URL(oauthPkceStateCookieValue.returnTo, request.url),
    StatusCodes.SEE_OTHER,
  );
}
