import 'server-only';
import { getServerEnvironment } from '@internal/base/config/server';
import { UnauthenticationError } from '@internal/base/exception/UnauthenticationError';
import { getSessionManager } from '@internal/base/session';
import {
  ClientSecretBasic,
  UserInfoResponse,
  generateRandomCodeVerifier,
  generateRandomNonce,
  generateRandomState,
} from 'oauth4webapi';
import { joinURL } from 'ufo';
import { AuthenticationSessionSchema } from '../shared/schemas';
import { IOIDCClient } from './OidcClient';
import {
  OIDCCallbackVerificationChecks,
  OIDCClientConfiguration,
  OIDCLoginRedirectResult,
} from './types';

/**
 * Reads, validates, and returns the OIDC client configuration from environment variables.
 *
 * All environment reads are parallelised. URL values are validated eagerly so
 * misconfiguration surfaces at startup rather than at request time.
 *
 * @returns The fully resolved {@link OIDCClientConfiguration}.
 */
export function resolveOIDCClientConfiguration(): OIDCClientConfiguration {
  return {
    issuer: getServerEnvironment('IAM_INTERNAL_ISSUER_URL'),
    client: { client_id: getServerEnvironment('IAM_OAUTH_CLIENT_ID') },
    clientAuth: ClientSecretBasic(getServerEnvironment('IAM_OAUTH_CLIENT_SECRET')),
    redirectUri: new URL('api/oidc/callback', getServerEnvironment('APP_URL')),
    allowInsecureRequests: getServerEnvironment('IAM_TLS_SKIP_VERIFY'),
  };
}

export { createOIDCClient } from './OidcClient';

/**
 * Prepares an OIDC login redirect by generating PKCE material and constructing
 * the authorization URL via the injected OIDC client.
 *
 * The caller must:
 * 1. Persist `result.credentials` to a signed session cookie before redirecting.
 * 2. Redirect the user's browser to `result.redirectURL`.
 *
 * The internal issuer origin on the URL is **not** rewritten here. If your
 * authorization server is behind a private network, pipe the `redirectURL`
 * through {@link rewriteAuthorizationURLToExternalIssuerOrigin} before redirecting.
 *
 * @param client - The OIDC client to use for discovery and URL construction.
 * @returns An {@link OIDCLoginRedirectResult} containing the redirect URL and credentials to persist.
 */
export async function prepareOIDCLoginRedirect(
  client: IOIDCClient,
): Promise<OIDCLoginRedirectResult> {
  const codeVerifier = generateRandomCodeVerifier();
  const state = generateRandomState();
  const nonce = generateRandomNonce();

  const redirectURL = await client.buildAuthorizationURL({ codeVerifier, state, nonce });

  return {
    redirectURL,
    credentials: { codeVerifier, state, nonce },
  };
}

/**
 * Validates the OIDC callback and exchanges the authorization code for tokens.
 *
 * Must be called from the `/api/oidc/callback` route handler after retrieving
 * the session cookie persisted during {@link prepareOIDCLoginRedirect}.
 *
 * @param client - The OIDC client to use for code exchange.
 * @param oidcCallbackURL - The full callback URL as received by the route handler.
 * @param callbackVerificationChecks - The `expectedState` and `pkceCodeVerifier` from the cookie.
 * @returns The token endpoint response containing the access, refresh, and ID tokens.
 */
export async function exchangeAuthorizationCodeForTokens(
  client: IOIDCClient,
  oidcCallbackURL: URL,
  callbackVerificationChecks: OIDCCallbackVerificationChecks,
) {
  return client.exchangeCode({
    callbackUrl: oidcCallbackURL,
    codeVerifier: callbackVerificationChecks.codeVerifier,
    expectedState: callbackVerificationChecks.expectedState,
    expectedNonce: callbackVerificationChecks.expectedNonce,
  });
}

/**
 * Rewrites the origin of an authorization URL from the internal issuer to the
 * external issuer, so browser redirects resolve correctly outside the private network.
 *
 * Only needed when your authorization server has separate internal and external URLs
 * (e.g. service-mesh or split-horizon DNS environments). Skip this step if
 * `IAM_INTERNAL_ISSUER_URL` and `IAM_EXTERNAL_ISSUER_URL` resolve to the same host.
 *
 * The path is preserved and prefixed with the external issuer's base path.
 * `.hostname` and `.port` are set separately (instead of `.host`) to avoid
 * duplicating the port when it is already implicit for the scheme.
 *
 * @param internalAuthorizationURL - The `redirectURL` from {@link prepareOIDCLoginRedirect}.
 * @returns A copy of the URL with its origin rewritten to the external issuer.
 * @throws {TypeError} If `IAM_EXTERNAL_ISSUER_URL` contains a malformed value.
 */
export function rewriteAuthorizationURLToExternalIssuerOrigin(internalAuthorizationURL: URL): URL {
  const rewrittenAuthorizationURL = new URL(internalAuthorizationURL.toString());
  const externalIssuerURL = getServerEnvironment('IAM_EXTERNAL_ISSUER_URL');

  rewrittenAuthorizationURL.protocol = externalIssuerURL.protocol;
  rewrittenAuthorizationURL.hostname = externalIssuerURL.hostname;
  rewrittenAuthorizationURL.port = externalIssuerURL.port;
  rewrittenAuthorizationURL.pathname = joinURL(
    externalIssuerURL.pathname,
    internalAuthorizationURL.pathname,
  );

  return rewrittenAuthorizationURL;
}

/**
 * Fetches and validates the OIDC UserInfo endpoint response for an authenticated user.
 *
 * Retrieves identity claims (name, email, subject identifier, etc.) by presenting
 * the access token to the authorization server's UserInfo endpoint, then validates
 * the `sub` claim to prevent token substitution attacks.
 *
 * Uses the current session to fetch the user profile.
 *
 * @param client - The OIDC client to use for the UserInfo request.
 * @returns The validated UserInfo claims for the authenticated user.
 * @throws {UnauthenticationError} If no active session is found.
 * @throws {WWWAuthenticateChallengeError} If the UserInfo request fails or the `sub` claim does not match.
 */
export async function fetchUserProfile(client: IOIDCClient): Promise<UserInfoResponse> {
  const sessionManager = getSessionManager(AuthenticationSessionSchema);
  const session = await sessionManager.get();

  if (session === undefined) {
    throw new UnauthenticationError('No active session found');
  }

  return client.fetchUserInfo({
    accessToken: session.accessToken,
    subjectIdentifier: session.idToken.claims.sub,
  });
}
