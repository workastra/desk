import 'server-only';
import { JWTPayload, decodeJwt } from 'jose';
import {
  AuthorizationServer,
  TokenEndpointResponse,
  UserInfoResponse,
  allowInsecureRequests,
  authorizationCodeGrantRequest,
  calculatePKCECodeChallenge,
  discoveryRequest,
  processAuthorizationCodeResponse,
  processDiscoveryResponse,
  processUserInfoResponse,
  userInfoRequest,
  validateAuthResponse,
} from 'oauth4webapi';
import { OIDCClientConfiguration } from './types';

type TokenResult = TokenEndpointResponse & { claims: JWTPayload };

/**
 * The seam between authentication orchestration and the OIDC protocol library.
 *
 * Callers drive the login → callback → profile flow through this interface.
 * The production adapter wraps oauth4webapi; a fake adapter enables testing
 * the full flow without a running IAM server.
 */
export interface IOIDCClient {
  /**
   * Fetches the authorization server's discovery document and returns the
   * authorization endpoint URL, with PKCE and state params set.
   */
  buildAuthorizationURL(parameters: {
    codeVerifier: string;
    state: string;
    nonce: string;
  }): Promise<URL>;

  /**
   * Validates the callback, exchanges the authorization code for tokens,
   * and decodes the JWT claims from the access token.
   */
  exchangeCode(parameters: {
    callbackUrl: URL;
    codeVerifier: string;
    expectedState: string;
    expectedNonce: string;
  }): Promise<TokenResult>;

  /**
   * Calls the UserInfo endpoint with the access token and validates the
   * `sub` claim to prevent token substitution attacks.
   */
  fetchUserInfo(parameters: {
    accessToken: string;
    subjectIdentifier: string;
  }): Promise<UserInfoResponse>;
}

/**
 * Production adapter. Wraps oauth4webapi and holds the resolved OIDC client
 * configuration. Discovery metadata is fetched per-call; callers are expected
 * to construct this once per request (e.g. inside a route handler).
 */
class OAuth4WebApiClient implements IOIDCClient {
  readonly #config: OIDCClientConfiguration;

  constructor(config: OIDCClientConfiguration) {
    this.#config = config;
  }

  async #discoverAuthorizationServer(): Promise<AuthorizationServer> {
    const raw = await discoveryRequest(this.#config.issuer, {
      algorithm: 'oidc',
      [allowInsecureRequests]: this.#config.allowInsecureRequests,
    });
    return processDiscoveryResponse(this.#config.issuer, raw);
  }

  async buildAuthorizationURL({
    codeVerifier,
    state,
    nonce,
  }: {
    codeVerifier: string;
    state: string;
    nonce: string;
  }): Promise<URL> {
    const authServer = await this.#discoverAuthorizationServer();

    if (!authServer.authorization_endpoint) {
      throw new Error(
        'OIDC discovery document is missing the required authorization_endpoint field.',
      );
    }

    const url = new URL(authServer.authorization_endpoint);
    url.searchParams.set('client_id', this.#config.client.client_id);
    url.searchParams.set('redirect_uri', this.#config.redirectUri.toString());
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid profile offline_access');
    url.searchParams.set('code_challenge', await calculatePKCECodeChallenge(codeVerifier));
    url.searchParams.set('code_challenge_method', 'S256');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);

    return url;
  }

  async exchangeCode({
    callbackUrl,
    codeVerifier,
    expectedState,
    expectedNonce,
  }: {
    callbackUrl: URL;
    codeVerifier: string;
    expectedState: string;
    expectedNonce: string;
  }): Promise<TokenResult> {
    const authServer = await this.#discoverAuthorizationServer();

    const validatedParameters = validateAuthResponse(
      authServer,
      this.#config.client,
      callbackUrl,
      expectedState,
    );

    const rawTokenResponse = await authorizationCodeGrantRequest(
      authServer,
      this.#config.client,
      this.#config.clientAuth,
      validatedParameters,
      this.#config.redirectUri.toString(),
      codeVerifier,
      { [allowInsecureRequests]: this.#config.allowInsecureRequests },
    );

    const tokens = await processAuthorizationCodeResponse(
      authServer,
      this.#config.client,
      rawTokenResponse,
      {
        requireIdToken: true,
        expectedNonce,
      },
    );

    const claims = decodeJwt(tokens.access_token);

    // @ts-expect-error: This occurs when 'exactOptionalPropertyTypes' is enabled in tsconfig.
    return { ...tokens, claims };
  }

  async fetchUserInfo({
    accessToken,
    subjectIdentifier,
  }: {
    accessToken: string;
    subjectIdentifier: string;
  }): Promise<UserInfoResponse> {
    const authServer = await this.#discoverAuthorizationServer();

    const raw = await userInfoRequest(authServer, this.#config.client, accessToken, {
      [allowInsecureRequests]: this.#config.allowInsecureRequests,
    });

    return processUserInfoResponse(authServer, this.#config.client, subjectIdentifier, raw);
  }
}

/**
 * Creates the production OIDC client for a given resolved configuration.
 */
export function createOIDCClient(config: OIDCClientConfiguration): IOIDCClient {
  return new OAuth4WebApiClient(config);
}
