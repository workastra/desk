import { afterEach, describe, expect, it, vi } from 'vitest';
import { decrypt, encrypt } from './crypto';

const { mockPrivateEnvironment } = vi.hoisted(() => ({
  mockPrivateEnvironment: {
    APP_KEY: '',
    APP_PREVIOUS_KEYS: [] as string[],
    APP_URL: new URL('https://example.com'),
    IS_PRODUCTION: false,
    IS_DEVELOPMENT: true,
    IS_TEST: false,
    IAM_EXTERNAL_ISSUER_URL: new URL('https://external.example.com'),
    IAM_INTERNAL_ISSUER_URL: new URL('https://internal.example.com'),
    IAM_TLS_SKIP_VERIFY: false,
    IAM_OAUTH_CLIENT_ID: 'client-id',
    IAM_OAUTH_CLIENT_SECRET: 'client-secret',
    LOCK_MODE: 'in-memory' as const,
  },
}));

vi.mock('../config/server', () => ({
  getServerEnvironment: (name: keyof typeof mockPrivateEnvironment) => mockPrivateEnvironment[name],
}));

/**
 * Generates a cryptographically strong random key.
 */
const genKey = () => crypto.randomUUID().replaceAll('-', '');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Config Fallback Behavior', () => {
  it('uses APP_KEY from config when encrypt key is omitted', async () => {
    const key = genKey();
    mockPrivateEnvironment.APP_KEY = key;
    mockPrivateEnvironment.APP_PREVIOUS_KEYS = [];

    const plaintext = 'config-fallback-encrypt';
    const cipher = await encrypt(plaintext);

    await expect(decrypt(cipher, key)).resolves.toBe(plaintext);
  });

  it('uses APP_KEY and APP_PREVIOUS_KEYS from config when decrypt keys are omitted', async () => {
    const oldKey = genKey();
    const newKey = genKey();

    const cipher = await encrypt('config-fallback-decrypt', oldKey);

    mockPrivateEnvironment.APP_KEY = newKey;
    mockPrivateEnvironment.APP_PREVIOUS_KEYS = [oldKey];

    await expect(decrypt(cipher)).resolves.toBe('config-fallback-decrypt');
  });
});

describe('encrypt / decrypt - Happy Path', () => {
  it('encrypts and decrypts correctly with primary key', async () => {
    const key = genKey();
    const plaintext = 'top-secret-2026';
    const cipher = await encrypt(plaintext, key);

    // Verification of JWE (JSON Web Encryption) Compact Serialization format:
    // Expected format: base64(header).base64(key).base64(iv).base64(ciphertext).base64(tag)
    expect(cipher).not.toBe(plaintext);
    expect(cipher.split('.')).toHaveLength(5);
    await expect(decrypt(cipher, [key])).resolves.toBe(plaintext);
  });

  it('decrypts correctly when a single key string is provided', async () => {
    const key = genKey();
    const plaintext = 'single-key-decrypt';
    const cipher = await encrypt(plaintext, key);

    await expect(decrypt(cipher, key)).resolves.toBe(plaintext);
  });

  it('produces different ciphertexts for the same plaintext (Nonces/IVs)', async () => {
    const key = genKey();

    const [a, b] = await Promise.all([encrypt('same-data', key), encrypt('same-data', key)]);

    // Security requirement: Encrypting the same data twice should result in
    // different outputs to prevent pattern analysis.
    expect(a).not.toBe(b);
  });

  it('supports unicode, emojis, and large payloads', async () => {
    const key = genKey();

    const cases = ['', '🚀🔥💯', '{"json":true}', 'a'.repeat(1024 * 1024)];

    await Promise.all(
      cases.map(async (input) => {
        const encrypted = await encrypt(input, key);
        await expect(decrypt(encrypted, [key])).resolves.toBe(input);
      }),
    );
  });
});

describe('Key Rotation Logic', () => {
  /**
   * Scenario: Data was encrypted with an old key. The system now has a new
   * primary key, but should still be able to decrypt using the previous key list.
   */
  it('decrypts using previous keys when primary key is rotated', async () => {
    const oldKey = genKey();
    const newKey = genKey();

    // 1. Encrypt using what is currently the primary key
    const cipher = await encrypt('historical-data', oldKey);

    // 2. Rotate: oldKey moves to the previous list, newKey becomes primary
    await expect(decrypt(cipher, [newKey, oldKey])).resolves.toBe('historical-data');
  });

  it('iterates through all previous keys until success', async () => {
    const keys = [genKey(), genKey(), genKey()] as [string, string, string];
    const targetKey = keys[2]; // Encrypt with the 3rd key in the list

    const cipher = await encrypt('multi-key-test', targetKey);

    // Place the correct key inside a list of multiple candidates
    const newPrimary = genKey();
    await expect(decrypt(cipher, [newPrimary, ...keys])).resolves.toBe('multi-key-test');
  });
});

describe('Error Handling & Security Integrity', () => {
  it('throws error if the key is empty', async () => {
    await expect(encrypt('test', '')).rejects.toThrow();
  });

  it('fails decryption if the ciphertext has been tampered with', async () => {
    const key = genKey();
    const cipher = await encrypt('sensitive-info', key);

    // Tamper with the Authentication Tag (the 5th part of the JWE)
    const parts = cipher.split('.');
    const tag = Buffer.from(parts[4], 'base64url');
    tag[0] ^= 0xff; // Flip bits to invalidate the integrity check
    parts[4] = Buffer.from(tag).toString('base64url');

    await expect(decrypt(parts.join('.'), [key])).rejects.toThrow();
  });

  it('throws if an empty key array is provided', async () => {
    const emptyKeys = [] as unknown as [string, ...string[]];

    await expect(decrypt('any-cipher', emptyKeys)).rejects.toThrow(
      'At least one key is required for decryption',
    );
  });

  it('throws generic error when all decryption attempts fail', async () => {
    const key = genKey();

    await expect(decrypt('invalid-ciphertext', [key])).rejects.toThrow(
      'Failed to decrypt payload with all available keys',
    );
  });
});
