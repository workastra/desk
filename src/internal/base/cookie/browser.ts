import { getServerEnvironment } from '../config/server';
import { CookieConfig } from './contracts';
import { CookieController } from './core';
import { DocumentStorage } from './storages/DocumentStorage';
import { NextServerStorage } from './storages/NextServerStorage';
import { UniversalStorage } from './storages/UniversalStorage';

/**
 * Configuration for a browser-accessible cookie.
 *
 * Unlike server cookies, this definition omits 'httpOnly', 'secure', and 'codec'
 * to ensure the cookie remains accessible to client-side scripts while
 * maintaining environment-driven security.
 *
 * @template T - The type of the data stored in the cookie.
 */
type BrowserCookieDefinition<T> = Omit<CookieConfig<T>, 'options' | 'codec'> & {
  /**
   * Cookie attributes.
   *
   * Note: 'httpOnly' and 'secure' are managed internally and cannot be overridden.
   */
  options: Omit<CookieConfig<T>['options'], 'httpOnly' | 'secure'>;
};

/**
 * Defines and initializes a universal cookie controller accessible by both server and browser.
 *
 * This function utilizes {@link UniversalStorage} to seamlessly switch between
 * Next.js server-side storage and standard browser `document.cookie`.
 *
 * ### Behavior & Security:
 * - `httpOnly`: Hardcoded to `false` to allow client-side JavaScript access.
 * - `secure`: Automatically set based on the `APP_URL` protocol (HTTPS).
 * - `path`: Defaults to `/` but can be overridden via `definition.options`.
 *
 * @template T - The type of the data stored in the cookie.
 *
 * @param definition - The name, schema, and optional configuration for the cookie.
 *
 * @returns A promise that resolves to a {@link CookieController} configured with {@link UniversalStorage}.
 */
export function defineBrowserCookie<T>(definition: BrowserCookieDefinition<T>) {
  const config: CookieConfig<T> = {
    name: definition.name,
    schema: definition.schema,
    options: Object.assign(
      {
        path: '/',
      },
      definition.options,
      {
        httpOnly: false,
        secure: getServerEnvironment('APP_URL').protocol === 'https:',
      },
    ),
  };

  const storage = new UniversalStorage(new NextServerStorage(), new DocumentStorage());

  return new CookieController(config, storage);
}
