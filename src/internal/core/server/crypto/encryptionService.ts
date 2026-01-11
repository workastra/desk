import 'server-only';
import {
  DecryptionError,
  EncryptionError,
  NoAlgorithmSpecifiedError,
  NoProvidersError,
  UnsupportedAlgorithmError,
} from './errors';
import {
  DecryptOptions,
  EncryptOptions,
  EncryptedMetadata,
  EncryptionProvider,
  EncryptionServiceConfig,
  SupportedAlgorithm,
} from './types';

/**
 * Encryption service with pluggable algorithm providers
 *
 * Features:
 * - No default algorithm - must explicitly specify algorithm for each operation
 * - Automatic algorithm detection during decryption via metadata
 * - Support for Additional Authenticated Data (AAD) via context parameter
 * - Thread-safe provider registration
 * - TypeScript autocomplete for supported algorithms
 *
 * @example
 * ```typescript
 * const service = new EncryptionService({
 *   providers: new Map([
 *     ["AES-256-GCM", new AesGcmProvider()]
 *   ])
 * });
 *
 * // Autocomplete will suggest "AES-256-GCM"
 * const encrypted = await service.encrypt("data", {
 *   algorithm: "AES-256-GCM",
 *   context: "user_123"
 * });
 *
 * const decrypted = await service.decrypt(encrypted, {
 *   context: "user_123"
 * });
 * ```
 */
export class EncryptionService {
  private readonly providers: Map<SupportedAlgorithm, EncryptionProvider>;

  /**
   * Create a new encryption service instance
   * @param config - Service configuration with registered providers
   */
  constructor(config: EncryptionServiceConfig) {
    this.providers = new Map(config.providers);

    if (this.providers.size === 0) {
      throw new NoProvidersError();
    }
  }

  /**
   * Get list of all supported algorithm identifiers
   * @returns Array of algorithm names
   */
  getSupportedAlgorithms(): SupportedAlgorithm[] {
    return [...this.providers.keys()];
  }

  /**
   * Check if an algorithm is supported
   * @param algorithm - Algorithm identifier to check
   * @returns True if algorithm is available
   */
  isAlgorithmSupported(algorithm: string): algorithm is SupportedAlgorithm {
    return this.providers.has(algorithm as SupportedAlgorithm);
  }

  /**
   * Get algorithm identifier from encrypted data metadata
   * @param encryptedText - Encrypted text with metadata
   * @returns Algorithm identifier or null if legacy format
   */
  getAlgorithmFromEncrypted(encryptedText: string): SupportedAlgorithm | undefined {
    try {
      const metadataJson = atob(encryptedText);
      const metadata: EncryptedMetadata = JSON.parse(metadataJson);
      return metadata.algorithm;
    } catch {
      return undefined;
    }
  }

  /**
   * Encrypt plaintext using the specified algorithm
   *
   * @param plaintext - Text to encrypt
   * @param options - Encryption options (algorithm is required, context is optional)
   * @returns Base64-encoded encrypted data with metadata
   *
   * @throws {NoAlgorithmSpecifiedError} If algorithm is not provided
   * @throws {UnsupportedAlgorithmError} If algorithm is not registered
   * @throws {EncryptionError} If encryption fails
   *
   * @example
   * ```typescript
   * // With context for AAD
   * const encrypted = await service.encrypt("sensitive data", {
   *   algorithm: "AES-256-GCM", // Autocomplete works here!
   *   context: "user_123"
   * });
   *
   * // Without context
   * const encrypted = await service.encrypt("public data", {
   *   algorithm: "AES-256-GCM"
   * });
   * ```
   */
  async encrypt(plaintext: string, options: EncryptOptions): Promise<string> {
    if (!options.algorithm) {
      throw new NoAlgorithmSpecifiedError(this.getSupportedAlgorithms());
    }

    const provider = this.providers.get(options.algorithm);
    if (!provider) {
      throw new UnsupportedAlgorithmError(options.algorithm, this.getSupportedAlgorithms());
    }

    try {
      const encrypted = await provider.encrypt(plaintext, options.context);

      // Wrap with metadata for automatic provider selection during decryption
      const metadata: EncryptedMetadata = {
        algorithm: provider.ALGORITHM_IDENTIFIER,
        version: 1,
        data: encrypted,
      };

      return btoa(JSON.stringify(metadata));
    } catch (error) {
      throw new EncryptionError('Encryption failed', options.algorithm, error);
    }
  }

  /**
   * Decrypt ciphertext with automatic algorithm detection
   *
   * The algorithm is automatically detected from the encrypted metadata.
   * If the data was encrypted with a context (AAD), the same context
   * must be provided for decryption to succeed.
   *
   * @param encryptedText - Encrypted text with metadata
   * @param options - Decryption options (context is optional)
   * @returns Decrypted plaintext
   *
   * @throws {DecryptionError} If decryption fails or context mismatch
   * @throws {UnsupportedAlgorithmError} If algorithm in metadata is not registered
   *
   * @example
   * ```typescript
   * // Decrypt with context
   * const decrypted = await service.decrypt(encrypted, {
   *   context: "user_123"
   * });
   *
   * // Decrypt without context
   * const decrypted = await service.decrypt(encrypted, {});
   *
   * // Or use shorthand
   * const decrypted = await service.decrypt(encrypted);
   * ```
   */
  async decrypt(encryptedText: string, options?: DecryptOptions): Promise<string> {
    if (!encryptedText) {
      throw new DecryptionError('Empty ciphertext');
    }

    try {
      // Parse metadata from encrypted data
      const metadataJson = atob(encryptedText);
      const metadata: EncryptedMetadata = JSON.parse(metadataJson);

      const provider = this.providers.get(metadata.algorithm);
      if (!provider) {
        throw new UnsupportedAlgorithmError(metadata.algorithm, this.getSupportedAlgorithms());
      }

      return await provider.decrypt(metadata.data, options?.context);
    } catch (error) {
      if (error instanceof UnsupportedAlgorithmError || error instanceof DecryptionError) {
        throw error;
      }

      throw new DecryptionError('Decryption failed', undefined, error);
    }
  }

  /**
   * Re-encrypt data with a different algorithm or context
   * Useful for algorithm migration or context updates
   *
   * @param encryptedText - Currently encrypted text
   * @param oldOptions - Options used for original encryption
   * @param newOptions - Options for re-encryption
   * @returns Re-encrypted data with new algorithm/context
   *
   * @example
   * ```typescript
   * // Migrate from AES to ChaCha20
   * const reEncrypted = await service.reEncrypt(
   *   oldEncrypted,
   *   { context: "user_123" },
   *   { algorithm: "ChaCha20-Poly1305", context: "user_123" }
   * );
   *
   * // Change context only
   * const reEncrypted = await service.reEncrypt(
   *   oldEncrypted,
   *   { context: "old_context" },
   *   { algorithm: "AES-256-GCM", context: "new_context" }
   * );
   * ```
   */
  async reEncrypt(
    encryptedText: string,
    oldOptions: DecryptOptions,
    newOptions: EncryptOptions,
  ): Promise<string> {
    const decrypted = await this.decrypt(encryptedText, oldOptions);
    return await this.encrypt(decrypted, newOptions);
  }
}
