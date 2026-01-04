import { NextRequest } from 'next/server';
import {
  getOidcConfiguration,
} from '@internal/features/authentication/server/actions';
import * as oidcClient from 'openid-client';
import { OAuthPkceStateCookie } from '@internal/features/authentication/shared/cookies';
import { ErrorResponse } from '@internal/core/response/canonical/v1/ErrorResponse';
import { ErrorCodes } from '@internal/features/authentication/shared';

export async function GET(request: NextRequest) {
  const oidcConfiguration = await getOidcConfiguration();

  const oauthPkceStateCookie = await OAuthPkceStateCookie.consume();

  if (!oauthPkceStateCookie) {
    return Response.json(
      new ErrorResponse(ErrorCodes.InvalidRequest),
      { status: 400 },
    );
  }

  const tokens = await oidcClient.authorizationCodeGrant(oidcConfiguration, request, {
    pkceCodeVerifier: oauthPkceStateCookie.codeVerifier,
    expectedNonce: oauthPkceStateCookie.nonce,
    expectedState: oauthPkceStateCookie.state,
  });

  return Response.json(tokens);
}
