import { Client, ClientAuth } from 'oauth4webapi';

/**
 * Resolved OIDC client configuration derived from environment variables.
 * All URL fields are pre-validated; the boolean flag mirrors the library symbol name.
 *
 * @see {@link resolveOIDCClientConfiguration} — the only intended way to construct this.
 */
export interface OIDCClientConfiguration {
  issuer: URL;
  client: Client;
  clientAuth: ClientAuth;
  redirectUri: URL;
  allowInsecureRequests: boolean;
}

/**
 * PKCE and state values generated at login initiation.
 *
 * ⚠️ The caller is responsible for persisting both fields to a signed session
 * cookie immediately after receiving this value, so they can be retrieved and
 * verified in the OIDC callback handler.
 *
 * @see {@link exchangeAuthorizationCodeForTokens} — consumes these values at callback time.
 */
interface OIDCLoginFlowCredentials {
  codeVerifier: string;
  state: string;
  nonce: string;
}

/**
 * The result of preparing an OIDC login redirect.
 *
 * - Redirect the user's browser to `redirectURL`.
 * - Persist `credentials` to a signed session cookie for verification during the callback.
 *
 * @see {@link prepareOIDCLoginRedirect}
 */
export interface OIDCLoginRedirectResult {
  /** The fully populated authorization URL to redirect the user's browser to. */
  redirectURL: URL;

  /** PKCE and state credentials that must be stored in a signed cookie for callback verification. */
  credentials: OIDCLoginFlowCredentials;
}

/**
 * The checks extracted from the session cookie set during login initiation.
 * Pass this directly to {@link exchangeAuthorizationCodeForTokens}.
 *
 * @see {@link OIDCLoginFlowCredentials} — the shape written to the cookie at login time.
 */
export interface OIDCCallbackVerificationChecks {
  codeVerifier: string;
  expectedState: string;
  expectedNonce: string;
}
