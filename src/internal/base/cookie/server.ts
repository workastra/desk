import 'server-only';
import { getServerEnvironment } from '../config/server';
import { CookieConfig } from './contracts';
import { CookieController } from './core';
import { NextServerStorage } from './storages/NextServerStorage';

/**
 * Represents the configuration for a server-side cookie,
 * omitting the 'secure' option to enforce internal environment-based security.
 *
 * @template T - The type of the data stored in the cookie.
 */
type ServerCookieDefinition<T> = Omit<CookieConfig<T>, 'options'> & {
  /**
   * Cookie attributes.
   *
   * The 'secure' property is managed automatically based on the application's protocol.
   */
  options: Omit<CookieConfig<T>['options'], 'secure'>;
};

/**
 * Defines and initializes a server-side cookie controller with enforced security defaults.
 * This function retrieves the application URL to automatically determine if the
 * cookie should be marked as `secure`. It uses `NextServerStorage` for
 * persistence within a Next.js server environment.
 *
 * ### Security Enforcement:
 * - `path`: Defaults to `/` (can be overridden).
 * - `httpOnly`: Defaults to `true` (can be overridden).
 * - `secure`: Automatically set to `true` if the APP_URL protocol is HTTPS.
 *
 * **Note:** This cannot be overridden by the definition.
 *
 * @template T - The type of the data stored in the cookie.
 *
 * @param definition - The name, schema, and optional serialization/deserialization logic.
 *
 * @returns A promise that resolves to a new {@link CookieController} instance.
 */
export function defineServerCookie<T>(definition: ServerCookieDefinition<T>): CookieController<T> {
  const config: CookieConfig<T> = {
    name: definition.name,
    schema: definition.schema,
    options: Object.assign(
      {
        path: '/',
        httpOnly: true,
      },
      definition.options,
      {
        secure: getServerEnvironment('APP_URL').protocol === 'https:',
      },
    ),
  };

  if (typeof definition.serialize === 'function') {
    config.serialize = definition.serialize;
  }

  if (typeof definition.deserialize === 'function') {
    config.deserialize = definition.deserialize;
  }

  return new CookieController(config, new NextServerStorage());
}
