import 'server-only';
import { EncryptionService } from './encryptionService';
import { JWEA256GCMProvider } from './providers/jweA256GcmProvider';
import { EncryptionProvider, SupportedAlgorithm } from './types';

/**
 * Singleton instance for application-wide use
 * Only created when getEncryptionService() is called
 */
let serviceInstance: EncryptionService | undefined;

/**
 * Create a new encryption service with registered providers
 *
 * This is the primary factory function for creating encryption service instances.
 * Use this when you need a fresh instance (e.g., in tests or isolated contexts).
 *
 * @param providers - Array of encryption providers to register
 * @returns New EncryptionService instance
 *
 * @example
 * ```typescript
 * // Create service with single provider
 * const service = createEncryptionService([new AesGcmProvider()]);
 *
 * // Create service with multiple providers
 * const service = createEncryptionService([
 *   new AesGcmProvider(),
 *   new ChaCha20Provider()
 * ]);
 * ```
 */
export function createEncryptionService(providers: EncryptionProvider[]): EncryptionService {
  const providerMap = new Map<SupportedAlgorithm, EncryptionProvider>();

  for (const provider of providers) {
    providerMap.set(provider.ALGORITHM_IDENTIFIER, provider);
  }

  return new EncryptionService({ providers: providerMap });
}

/**
 * Get the application-wide singleton encryption service instance
 *
 * The instance is created lazily on first access with AES-GCM as the only provider.
 * For most application code, this is the recommended way to access encryption.
 *
 * Note: This creates a singleton. For testing, use createEncryptionService() instead
 * or call resetEncryptionService() in test setup.
 *
 * @returns Shared EncryptionService instance
 *
 * @example
 * ```typescript
 * // In application code
 * const service = getEncryptionService();
 * const encrypted = await service.encrypt("data", {
 *   algorithm: "AES-256-GCM",
 *   context: "user_123"
 * });
 * ```
 */
export function getEncryptionService(): EncryptionService {
  if (!serviceInstance) {
    // Initialize with AES-GCM provider only
    // Add more providers here as needed
    serviceInstance = createEncryptionService([
      new JWEA256GCMProvider(),
      // Add more providers: new ChaCha20Provider(), etc.
    ]);
  }

  return serviceInstance;
}

/**
 * Reset the singleton instance
 *
 * This is primarily useful for testing to ensure test isolation.
 * Call this in beforeEach() or afterEach() test hooks.
 *
 * WARNING: Do not call this in production code as it will affect
 * all code using the singleton instance.
 *
 * @example
 * ```typescript
 * describe("MyService", () => {
 *   beforeEach(() => {
 *     resetEncryptionService();
 *   });
 *
 *   it("should encrypt data", () => {
 *     const service = getEncryptionService();
 *     // ... test code
 *   });
 * });
 * ```
 */
export function resetEncryptionService(): void {
  serviceInstance = undefined;
}
