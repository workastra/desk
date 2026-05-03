import { SerializeOptions } from 'cookie';
import { z } from 'zod';

/**
 * Defines the strategy for raw cookie persistence.
 */
export interface ICookieStorage {
  /**
   * Retrieves the raw string value of a cookie by name.
   *
   * @param name - The unique identifier of the cookie.
   * @returns A promise resolving to the string value, or undefined if not found.
   */
  read(name: string): Promise<string | undefined>;

  /**
   * Persists a raw string value to the cookie storage.
   *
   * @param name - The unique identifier of the cookie.
   * @param value - The serialized string to store.
   * @param options - Standard cookie attributes (path, domain, maxAge, etc.).
   */
  write(name: string, value: string, options: SerializeOptions): Promise<void>;

  /**
   * Removes a cookie from the storage.
   *
   * @param name - The unique identifier of the cookie.
   * @param options - Options used to locate the cookie (must match path/domain of the original).
   */
  delete(name: string, options: SerializeOptions): Promise<void>;
}

/**
 * Configuration object for a managed cookie.
 *
 * Combines metadata, validation logic, and optional custom transformation hooks
 * to handle complex data types (T) within a string-based cookie environment.
 *
 * @template T - The type of the structured data represented by the cookie.
 */
export interface CookieConfig<T> {
  /** The key name used to store the cookie in the header/document. */
  name: string;

  /**
   * A Zod schema used to validate the data during retrieval (deserialization).
   *
   * Ensures type safety at the runtime boundary.
   */
  schema: z.ZodType<T>;

  /**
   * Standard cookie attributes defining the cookie's lifecycle and scope.
   *
   * @see {@link SerializeOptions}
   */
  options: SerializeOptions;

  /**
   * Optional custom logic to transform the typed value into a string.
   * If omitted, standard JSON stringification is typically used.
   */
  serialize?: (value: T) => Promise<string> | string;

  /**
   * Optional custom logic to transform the raw string back into the typed value.
   * Should return undefined or throw if validation fails.
   */
  deserialize?: (schema: z.ZodType<T>, value: string) => Promise<T> | T | undefined;
}
