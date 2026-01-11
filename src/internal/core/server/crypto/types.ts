import { PrivateEnvironment } from "../config";

/**
 * Supported encryption algorithms
 * Add new algorithms here for autocomplete support
 */
export type SupportedAlgorithm = 'JWE-A256GCM';

/**
 * Options for encryption operations
 */
export interface EncryptOptions {
  /**
   * Encryption algorithm to use
   */
  algorithm: SupportedAlgorithm;

  /**
   * Optional context for Additional Authenticated Data (AAD)
   * Used to bind encrypted data to specific context (e.g., user ID, resource ID)
   * @example "user:123", "tenant:acme:resource:456"
   */
  context?: string;
}

/**
 * Options for decryption operations
 */
export interface DecryptOptions {
  /**
   * Optional context that was used during encryption
   * Must match the context used in encryption for successful decryption
   */
  context?: string;
}

/**
 * Core abstract encryption provider
 * Handles secret key loading + rotation
 */
export abstract class EncryptionProvider {
  /**
   * Unique identifier for the encryption algorithm
   */
  public abstract readonly ALGORITHM_IDENTIFIER: SupportedAlgorithm;

  /**
   * Encrypt plaintext with optional context (AAD)
   */
  public abstract encrypt(plaintext: string, context?: string): Promise<string>;

  /**
   * Decrypt ciphertext with optional context (AAD)
   */
  public abstract decrypt(ciphertext: string, context?: string): Promise<string>;

  private cryptoKeyCache = new Map<string, CryptoKey>();

  /**
   * Load comma-separated secrets from env
   * SECRET="k1,k2,k3"
   */
  protected getSecretList(): string[] {
    if (!PrivateEnvironment.SECRET) {
      throw new Error('Configuration error');
    }

    const secrets = PrivateEnvironment.SECRET
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (secrets.length === 0) {
      throw new Error('Configuration error');
    }

    return secrets;
  }

  /**
   * Import base64 secret → CryptoKey (cached)
   */
  protected async getCryptoKey(base64Secret: string): Promise<CryptoKey> {
    const cached = this.cryptoKeyCache.get(base64Secret);
    if (cached) return cached;

    const rawKey = Buffer.from(base64Secret, 'base64');
    if (rawKey.length !== 32) {
      throw new Error('Invalid secret key length');
    }

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      rawKey,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt'],
    );

    this.cryptoKeyCache.set(base64Secret, cryptoKey);
    return cryptoKey;
  }

  /**
   * Active key (first secret, used for encryption)
   */
  protected async getActiveCryptoKey(): Promise<CryptoKey> {
    const [active] = this.getSecretList();
    return this.getCryptoKey(active);
  }

  /**
   * All keys (used for decryption with rotation)
   */
  protected async getAllCryptoKeys(): Promise<CryptoKey[]> {
    const secrets = this.getSecretList();
    return Promise.all(secrets.map(s => this.getCryptoKey(s)));
  }
}


/**
 * Metadata wrapper for encrypted data
 * Enables automatic provider selection during decryption
 */
export interface EncryptedMetadata {
  /** Algorithm identifier used for encryption */
  algorithm: SupportedAlgorithm;
  /** Format version for future compatibility */
  version: number;
  /** The actual encrypted data */
  data: string;
}

/**
 * Configuration for encryption service
 */
export interface EncryptionServiceConfig {
  /** Map of algorithm identifiers to their providers */
  providers: Map<SupportedAlgorithm, EncryptionProvider>;
}
