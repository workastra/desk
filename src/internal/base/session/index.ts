import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { getServerEnvironment } from '@internal/base/config/server';
import { IronSession, SessionOptions as IronSessionOptions, getIronSession } from 'iron-session';
import z from 'zod';

/**
 * The seam between SessionManager and the underlying cookie storage.
 *
 * The production adapter wraps iron-session; a fake adapter enables testing
 * session lifecycle logic (key rotation, schema validation, destroy) without
 * a real HTTP request context.
 */
interface ISessionStore {
  /** Read all session data, excluding internal iron-session methods. */
  read(): Promise<Record<string, unknown>>;
  /** Overwrite session data and persist it. */
  write(data: Record<string, unknown>): Promise<void>;
  /** Destroy the session cookie. */
  destroy(): Promise<void>;
}

const IRON_SESSION_METHODS = new Set(['save', 'destroy', 'updateConfig']);

/** Production adapter: wraps iron-session + next/headers cookies(). */
class IronSessionStore implements ISessionStore {
  readonly #options: IronSessionOptions;

  constructor(options: IronSessionOptions) {
    this.#options = options;
  }

  async #getInternal(): Promise<IronSession<object>> {
    return await getIronSession(
      // @ts-expect-error: Incompatibility between iron-session and Next.js cookies().
      // This occurs when 'exactOptionalPropertyTypes' is enabled in tsconfig.
      // TODO: Remove this bypass once the upstream issue is resolved:
      // https://github.com/vvo/iron-session/issues/840#issuecomment-3016338754
      await cookies(),
      this.#options,
    );
  }

  async read(): Promise<Record<string, unknown>> {
    const session = await this.#getInternal();
    const data: Record<string, unknown> = {};

    for (const key in session) {
      if (!IRON_SESSION_METHODS.has(key)) {
        data[key] = session[key as keyof typeof session];
      }
    }

    return data;
  }

  async write(data: Record<string, unknown>): Promise<void> {
    const session = await this.#getInternal();

    for (const key in session) {
      if (!IRON_SESSION_METHODS.has(key)) {
        delete session[key as keyof typeof session];
      }
    }

    Object.assign(session, data);
    await session.save();
  }

  async destroy(): Promise<void> {
    const session = await this.#getInternal();
    session.destroy();
  }
}

class SessionManager<T extends z.ZodObject> {
  readonly #store: ISessionStore;
  readonly #schema: T;

  constructor(store: ISessionStore, schema: T) {
    this.#store = store;
    this.#schema = schema;
  }

  /** Retrieve and validate the session against the Zod schema */
  async get(): Promise<Readonly<z.infer<T>> | undefined> {
    const data = await this.#store.read();
    const result = this.#schema.safeParse(data);

    return result.success ? (result.data as Readonly<z.infer<T>>) : undefined;
  }

  /** Replace session data with a new validated object */
  async replace(value: z.infer<T>): Promise<void> {
    const validated = this.#schema.parse(value);
    await this.#store.write(validated);
  }

  /** Destroy the session cookie */
  async destroy(): Promise<void> {
    await this.#store.destroy();
  }

  /** Check if a valid session exists and matches the schema */
  async exists(): Promise<boolean> {
    return (await this.get()) != undefined;
  }
}

/**
 * Initializes and returns the session manager with automatic key rotation support.
 * We use "Key Rotation" to keep sessions secure. By providing multiple keys,
 * we can change our encryption password without logging out all current users.
 */
export const getSessionManager = cache(<TSchema extends z.ZodObject>(schema: TSchema) => {
  // 1. Fetch encryption keys from a secure environment (Vault, AWS Secrets, etc.)
  // We fetch both the current 'active' key and a list of 'older' valid keys.

  // 2. Prepare keys for iron-session.
  // The library expects an object where the highest index is used to ENCRYPT new sessions,
  // while all indices (0, 1, 2...) can be used to DECRYPT existing sessions.
  // By putting the Primary Key LAST, it becomes the highest index (the active signer).
  const orderedKeys = [
    ...getServerEnvironment('APP_PREVIOUS_KEYS'),
    getServerEnvironment('APP_KEY'),
  ];

  /**
   * 3. Transform the Array of keys into an Indexed Object.
   * Result format: { "0": "old_key_1", "1": "old_key_2", "2": "current_primary_key" }
   * 'iron-session' uses this map to transition smoothly between password changes.
   */
  const password = Object.fromEntries(orderedKeys.map((key, index) => [index.toString(), key]));

  const store = new IronSessionStore({ cookieName: '__Secure_Session', password });

  return new SessionManager(store, schema);
});
