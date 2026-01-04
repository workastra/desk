import 'server-only';
import { PublicEnvironment } from '@internal/core/client';
import { PrivateEnvironment } from '@internal/core/server/config';
import * as OpenIDClient from 'openid-client';
import { OAuthPkceStateCookie } from '../shared/cookies';

export async function getOidcConfiguration() {
  const discoveryOptions: OpenIDClient.DiscoveryRequestOptions =
    PrivateEnvironment.IAM_TLS_SKIP_VERIFY ? { execute: [OpenIDClient.allowInsecureRequests] } : {};

  const configuration = await OpenIDClient.discovery(
    new URL(PrivateEnvironment.IAM_ISSUER_URL),
    PrivateEnvironment.IAM_OAUTH_CLIENT_ID,
    undefined,
    undefined,
    discoveryOptions,
  );

  return configuration;
}

export async function createAuthorizationRequest() {
  const codeVerifier = OpenIDClient.randomPKCECodeVerifier();
  const nonce = OpenIDClient.randomNonce();
  const state = OpenIDClient.randomState();

  const authorizationURL = OpenIDClient.buildAuthorizationUrl(
    await getOidcConfiguration(),
    new URLSearchParams({
      redirect_uri: new URL('api/oidc/callback', PublicEnvironment.NEXT_PUBLIC_BASE_URL).toString(),
      scope: 'openid profile offline_access',
      code_challenge: await OpenIDClient.calculatePKCECodeChallenge(codeVerifier),
      code_challenge_method: 'S256',
      nonce,
      state,
    }),
  );

  await OAuthPkceStateCookie.push({
    codeVerifier,
    state,
    nonce,
  })

  return {
    authorizationURL,
  };
}
