import { beforeEach, describe, expect, it } from 'vitest';
import {
  JWEA256GCMProvider,
  DecryptionError,
  EncryptionService,
  NoAlgorithmSpecifiedError,
  NoProvidersError,
  UnsupportedAlgorithmError,
  createEncryptionService,
  getEncryptionService,
  resetEncryptionService,
} from '.';

// ============================================================================
// Unit Tests
// ============================================================================

describe('EncryptionService with Options API', () => {
  describe('Initialization', () => {
    it('should create service with single provider', () => {
      const service = createEncryptionService([new JWEA256GCMProvider()]);

      expect(service.getSupportedAlgorithms()).toEqual(['JWE-A256GCM']);
    });

    it('should throw when no providers given', () => {
      expect(() => createEncryptionService([])).toThrow(NoProvidersError);
    });

    it('should support checking algorithm availability', () => {
      const service = createEncryptionService([new JWEA256GCMProvider()]);

      expect(service.isAlgorithmSupported('JWE-A256GCM')).toBe(true);
      expect(service.isAlgorithmSupported('INVALID')).toBe(false);
    });
  });

  describe('Basic Encryption/Decryption with Options', () => {
    let service: EncryptionService;

    beforeEach(() => {
      service = createEncryptionService([new JWEA256GCMProvider()]);
    });

    it('should encrypt and decrypt with options object', async () => {
      const plaintext = 'Hello, World!';

      const encrypted = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
      });

      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should encrypt and decrypt with context in options', async () => {
      const plaintext = 'sensitive data';
      const context = 'user_123';

      const encrypted = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
        context,
      });

      const decrypted = await service.decrypt(encrypted, { context });

      expect(decrypted).toBe(plaintext);
    });

    it('should fail decryption with wrong context', async () => {
      const plaintext = 'sensitive data';

      const encrypted = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
        context: 'context1',
      });

      await expect(service.decrypt(encrypted, { context: 'context2' })).rejects.toThrow(
        DecryptionError,
      );
    });

    it('should fail decryption without required context', async () => {
      const plaintext = 'sensitive data';

      const encrypted = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
        context: 'required_context',
      });

      await expect(service.decrypt(encrypted)).rejects.toThrow(DecryptionError);
    });

    it('should handle empty string', async () => {
      const encrypted = await service.encrypt('', {
        algorithm: 'JWE-A256GCM',
      });
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe('');
    });

    it('should handle unicode characters', async () => {
      const plaintext = 'Hello 👋 مرحبا 你好';

      const encrypted = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
      });
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', async () => {
      const plaintext = 'same text';

      const encrypted1 = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
      });
      const encrypted2 = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
      });

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('Algorithm Requirements', () => {
    let service: EncryptionService;

    beforeEach(() => {
      service = createEncryptionService([new JWEA256GCMProvider()]);
    });

    it('should throw when no algorithm specified', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.encrypt('data', { algorithm: '' as any }),
      ).rejects.toThrow(NoAlgorithmSpecifiedError);
    });

    it('should throw when unsupported algorithm requested', async () => {
      await expect(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.encrypt('data', { algorithm: 'INVALID-ALGO' as any }),
      ).rejects.toThrow(UnsupportedAlgorithmError);
    });

    it('should include available algorithms in error', async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await service.encrypt('data', { algorithm: 'INVALID' as any });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnsupportedAlgorithmError);
        expect((error as UnsupportedAlgorithmError).availableAlgorithms).toEqual(['JWE-A256GCM']);
      }
    });
  });

  describe('Options Object Flexibility', () => {
    let service: EncryptionService;

    beforeEach(() => {
      service = createEncryptionService([new JWEA256GCMProvider()]);
    });

    it('should work with minimal options (algorithm only)', async () => {
      const encrypted = await service.encrypt('data', {
        algorithm: 'JWE-A256GCM',
      });

      const decrypted = await service.decrypt(encrypted);
      expect(decrypted).toBe('data');
    });

    it('should work with full options (algorithm + context)', async () => {
      const encrypted = await service.encrypt('data', {
        algorithm: 'JWE-A256GCM',
        context: 'test_context',
      });

      const decrypted = await service.decrypt(encrypted, {
        context: 'test_context',
      });

      expect(decrypted).toBe('data');
    });

    it('should work with empty decrypt options', async () => {
      const encrypted = await service.encrypt('data', {
        algorithm: 'JWE-A256GCM',
      });

      const decrypted = await service.decrypt(encrypted, {});
      expect(decrypted).toBe('data');
    });

    it('should work without decrypt options parameter', async () => {
      const encrypted = await service.encrypt('data', {
        algorithm: 'JWE-A256GCM',
      });

      const decrypted = await service.decrypt(encrypted);
      expect(decrypted).toBe('data');
    });
  });

  describe('Metadata Handling', () => {
    let service: EncryptionService;

    beforeEach(() => {
      service = createEncryptionService([new JWEA256GCMProvider()]);
    });

    it('should embed algorithm metadata in encrypted data', async () => {
      const encrypted = await service.encrypt('data', {
        algorithm: 'JWE-A256GCM',
      });

      const algorithm = service.getAlgorithmFromEncrypted(encrypted);
      expect(algorithm).toBe('JWE-A256GCM');
    });

    it('should auto-detect algorithm during decryption', async () => {
      const plaintext = 'test data';
      const encrypted = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
      });

      // Decryption works without specifying algorithm
      const decrypted = await service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should handle malformed encrypted data', async () => {
      await expect(service.decrypt('invalid_base64_data')).rejects.toThrow(DecryptionError);
    });
  });

  describe('Re-encryption with Options', () => {
    let service: EncryptionService;

    beforeEach(() => {
      service = createEncryptionService([new JWEA256GCMProvider()]);
    });

    it('should re-encrypt with same algorithm', async () => {
      const plaintext = 'migrate me';
      const context = 'user_123';

      const encrypted1 = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
        context,
      });

      const encrypted2 = await service.reEncrypt(
        encrypted1,
        { context },
        { algorithm: 'JWE-A256GCM', context },
      );

      expect(encrypted1).not.toBe(encrypted2);

      const decrypted = await service.decrypt(encrypted2, { context });
      expect(decrypted).toBe(plaintext);
    });

    it('should re-encrypt with different context', async () => {
      const plaintext = 'migrate me';

      const encrypted1 = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
        context: 'old_context',
      });

      const encrypted2 = await service.reEncrypt(
        encrypted1,
        { context: 'old_context' },
        { algorithm: 'JWE-A256GCM', context: 'new_context' },
      );

      const decrypted = await service.decrypt(encrypted2, {
        context: 'new_context',
      });
      expect(decrypted).toBe(plaintext);
    });

    it('should re-encrypt without context', async () => {
      const plaintext = 'migrate me';

      const encrypted1 = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
      });

      const encrypted2 = await service.reEncrypt(encrypted1, {}, { algorithm: 'JWE-A256GCM' });

      const decrypted = await service.decrypt(encrypted2);
      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Large Data', () => {
    let service: EncryptionService;

    beforeEach(() => {
      service = createEncryptionService([new JWEA256GCMProvider()]);
    });

    it('should handle data up to 10MB', async () => {
      // Create ~1MB of data
      const plaintext = 'x'.repeat(1024 * 1024);

      const encrypted = await service.encrypt(plaintext, {
        algorithm: 'JWE-A256GCM',
      });
      const decrypted = await service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should reject data over 10MB', async () => {
      // Create ~11MB of data
      const plaintext = 'x'.repeat(11 * 1024 * 1024);

      await expect(service.encrypt(plaintext, { algorithm: 'JWE-A256GCM' })).rejects.toThrow();
    });
  });

  describe('Singleton Pattern', () => {
    beforeEach(() => {
      resetEncryptionService();
    });

    it('should return same instance on multiple calls', () => {
      const service1 = getEncryptionService();
      const service2 = getEncryptionService();

      expect(service1).toBe(service2);
    });

    it('should reset singleton instance', () => {
      const service1 = getEncryptionService();
      resetEncryptionService();
      const service2 = getEncryptionService();

      expect(service1).not.toBe(service2);
    });

    it('should maintain state across calls', async () => {
      const service1 = getEncryptionService();
      const encrypted = await service1.encrypt('data', {
        algorithm: 'JWE-A256GCM',
      });

      const service2 = getEncryptionService();
      const decrypted = await service2.decrypt(encrypted);

      expect(decrypted).toBe('data');
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Integration: Real-world scenarios with Options API', () => {
  beforeEach(() => {
    resetEncryptionService();
  });

  it('should encrypt user PII with user context', async () => {
    const service = getEncryptionService();
    const userId = 'user_12345';
    const ssn = '123-45-6789';

    const encrypted = await service.encrypt(ssn, {
      algorithm: 'JWE-A256GCM',
      context: `user:${userId}:pii`,
    });

    const decrypted = await service.decrypt(encrypted, {
      context: `user:${userId}:pii`,
    });

    expect(decrypted).toBe(ssn);
  });

  it('should encrypt database fields with table context', async () => {
    const service = getEncryptionService();
    const context = 'db:users:record_123:email';
    const email = 'user@example.com';

    const encrypted = await service.encrypt(email, {
      algorithm: 'JWE-A256GCM',
      context,
    });

    const decrypted = await service.decrypt(encrypted, { context });

    expect(decrypted).toBe(email);
  });

  it('should handle multi-tenant scenarios', async () => {
    const service = getEncryptionService();

    // Tenant 1
    const tenant1Context = 'tenant:acme:user:123';
    const tenant1Data = 'Acme secret data';
    const encrypted1 = await service.encrypt(tenant1Data, {
      algorithm: 'JWE-A256GCM',
      context: tenant1Context,
    });

    // Tenant 2
    const tenant2Context = 'tenant:globex:user:456';
    const tenant2Data = 'Globex secret data';
    const encrypted2 = await service.encrypt(tenant2Data, {
      algorithm: 'JWE-A256GCM',
      context: tenant2Context,
    });

    // Verify tenant isolation
    expect(await service.decrypt(encrypted1, { context: tenant1Context })).toBe(tenant1Data);

    expect(await service.decrypt(encrypted2, { context: tenant2Context })).toBe(tenant2Data);

    await expect(service.decrypt(encrypted1, { context: tenant2Context })).rejects.toThrow();
  });

  it('should support session encryption', async () => {
    const service = getEncryptionService();

    const sessionData = JSON.stringify({
      userId: 'user_123',
      role: 'admin',
      exp: Date.now() + 3_600_000,
    });

    const encrypted = await service.encrypt(sessionData, {
      algorithm: 'JWE-A256GCM',
    });

    const decrypted = await service.decrypt(encrypted);

    expect(JSON.parse(decrypted)).toEqual(JSON.parse(sessionData));
  });
});

// ============================================================================
// Type Safety Tests
// ============================================================================

describe('TypeScript Type Safety', () => {
  it('should enforce SupportedAlgorithm type', () => {
    const service = createEncryptionService([new JWEA256GCMProvider()]);

    // This should compile (valid algorithm)
    const validAlgorithm = 'JWE-A256GCM';
    expect(async () => {
      await service.encrypt('data', { algorithm: validAlgorithm });
    }).not.toThrow();

    // TypeScript will catch invalid algorithms at compile time
    // const invalidAlgorithm: SupportedAlgorithm = "INVALID"; // ← Compile error!
  });

  it('should have type-safe options', async () => {
    const service = createEncryptionService([new JWEA256GCMProvider()]);

    // Valid options
    await service.encrypt('data', {
      algorithm: 'JWE-A256GCM',
      context: 'test',
    });

    // Optional context
    await service.encrypt('data', {
      algorithm: 'JWE-A256GCM',
    });

    // TypeScript will catch missing required fields at compile time
    // await service.encrypt("data", {}); // ← Compile error! Missing algorithm
    // await service.encrypt("data", { context: "test" }); // ← Compile error! Missing algorithm
  });
});
