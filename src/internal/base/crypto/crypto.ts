import { CompactEncrypt, compactDecrypt } from 'jose';
import { getServerEnvironment } from '../config/server';

/**
 * Encrypts a UTF-8 string using JWE (JSON Web Encryption) with
 * direct symmetric encryption (alg: "dir") and AES-256-GCM (enc: "A256GCM").
 *
 * @param plainText - The UTF-8 text to encrypt.
 * @param key - Optional symmetric key. Defaults to APP_KEY from config.
 * @returns A Promise that resolves to a JWE Compact Serialization string.
 *
 * @throws {Error} If the encryption key is missing or invalid.
 *
 * @example
 * const token = await encrypt('hello world');
 * const tokenWithCustomKey = await encrypt('hello world', appKey);
 */
export async function encrypt(plainText: string, key?: string): Promise<string> {
  const encoder = new TextEncoder();
  const resolvedKey = key ?? getServerEnvironment('APP_KEY');

  return new CompactEncrypt(encoder.encode(plainText))
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(encoder.encode(resolvedKey));
}

/**
 * Decrypts a JWE Compact Serialization string back into a UTF-8 string.
 *
 * Supports key rotation by attempting decryption with each key in order
 * until one succeeds.
 *
 * @param encryptedText - The JWE Compact Serialization string to decrypt.
 * @param keys - Optional key input. Accepts a single key string, or an ordered
 * non-empty list of keys to try. Defaults to config key schedule.
 * @returns A Promise that resolves to the decrypted UTF-8 string.
 *
 * @throws {Error} If decryption fails with all available keys.
 *
 * @example
 * const text = await decrypt(token);
 * const textWithSingleKey = await decrypt(token, appKey);
 * const textWithCustomKeySchedule = await decrypt(token, [appKey, ...previousKeys]);
 */
export async function decrypt(
  encryptedText: string,
  keys?: string | [string, ...string[]],
): Promise<string> {
  const encoder = new TextEncoder();
  const resolvedKeys =
    keys == undefined
      ? [getServerEnvironment('APP_KEY'), ...getServerEnvironment('APP_PREVIOUS_KEYS')]
      : typeof keys === 'string'
        ? [keys]
        : keys;

  if (resolvedKeys.length === 0) {
    throw new Error('At least one key is required for decryption');
  }

  let lastError: unknown;

  try {
    return await Promise.any(
      resolvedKeys.map(async (key) => {
        const { plaintext } = await compactDecrypt(encryptedText, encoder.encode(key));

        return new TextDecoder().decode(plaintext);
      }),
    );
  } catch (error) {
    lastError = error instanceof AggregateError ? error.errors.at(-1) : error;
  }

  throw new Error('Failed to decrypt payload with all available keys', { cause: lastError });
}
