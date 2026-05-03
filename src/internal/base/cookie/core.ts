import { CookieConfig, ICookieStorage } from './contracts';
import { JsonDeserializer, JsonSerializer } from './serializers/json.serializer';

/**
 * Provides low-level cookie operations (read, write, delete) with encoding and decoding handled
 * transparently. This class acts as a thin abstraction over the underlying storage and codec
 * layers, exposing a typed interface for cookie access.
 *
 * @typeParam T - The logical data type stored in the cookie
 */
class RawCookieHandle<T> {
  #storage: ICookieStorage;
  #config: CookieConfig<T>;

  constructor(storage: ICookieStorage, config: CookieConfig<T>) {
    this.#storage = storage;
    this.#config = Object.assign(
      {
        serialize: JsonSerializer,
        deserialize: JsonDeserializer,
      },
      config,
    );
  }

  /**
   * Reads and decodes the cookie value.
   *
   * @returns The decoded value, or `undefined` if the cookie does not exist or is empty
   */
  async get(): Promise<T | undefined> {
    const raw = await this.#storage.read(this.#config.name);
    if (!raw) return undefined;

    return this.#config.deserialize!(this.#config.schema, raw);
  }

  /**
   * Encodes and writes a value to the cookie.
   *
   * @param value - The value to persist
   */
  async set(value: T): Promise<void> {
    const encoded = await this.#config.serialize!(value);
    await this.#storage.write(this.#config.name, encoded, this.#config.options);
  }

  /**
   * Removes the cookie.
   */
  async remove(): Promise<void> {
    await this.#storage.delete(this.#config.name, this.#config.options);
  }
}

/**
 * Provides signal-style semantics on top of cookie storage. A signal cookie is intended for
 * one-time consumption: `push` writes a value, and `consume` reads and clears it. This is useful
 * for scenarios such as flash messages, redirects, or cross-request communication.
 *
 * @typeParam T - The logical data type stored in the cookie
 */
class SignalCookieHandle<T> {
  #rawHandle: RawCookieHandle<T>;
  #seen: boolean = false;

  constructor(rawHandler: RawCookieHandle<T>) {
    this.#rawHandle = rawHandler;
  }

  /**
   * Writes a value to the cookie.
   *
   * @param value - The value to push
   */
  async push(value: T): Promise<void> {
    await this.#rawHandle.set(value);
  }

  /**
   * Reads the cookie value once and removes it. Subsequent calls will always return `undefined`,
   * even if the underlying cookie still exists.
   *
   * @returns The consumed value, or `undefined` if already consumed or not present
   */
  async consume(): Promise<T | undefined> {
    if (this.#seen) {
      return undefined;
    }

    const value = await this.#rawHandle.get();

    if (value) {
      await this.#rawHandle.remove();
    }

    return value;
  }
}

/**
 * High-level controller responsible for constructing cookie handlers. It encapsulates
 * configuration, storage, and codec selection, and exposes different interaction models such as
 * raw access (`asRaw`) and signal-style access (`asSignal`). If no codec is provided in the
 * configuration, a JSON-based codec is used by default.
 *
 * @typeParam T - The logical data type stored in the cookie
 */
export class CookieController<T> {
  #config: CookieConfig<T>;
  #storage: ICookieStorage;

  constructor(config: CookieConfig<T>, storage: ICookieStorage) {
    this.#config = config;
    this.#storage = storage;
  }

  /**
   * Creates a raw cookie handle for direct manipulation.
   *
   * @returns A RawCookieHandle instance
   */
  asRaw(): RawCookieHandle<T> {
    return new RawCookieHandle(this.#storage, this.#config);
  }

  /**
   * Creates a signal-style cookie handle for one-time consumption patterns.
   *
   * @returns A SignalCookieHandle instance
   */
  asSignal(): SignalCookieHandle<T> {
    return new SignalCookieHandle(this.asRaw());
  }
}
