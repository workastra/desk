import 'server-only';
import { EncryptionProvider } from '../types';
import { CompactEncrypt, compactDecrypt } from 'jose';

export class JWEA256GCMProvider extends EncryptionProvider {
  public readonly ALGORITHM_IDENTIFIER = 'JWE-A256GCM';

  async encrypt(plaintext: string, context?: string): Promise<string> {
    if (!plaintext) return '';

    try {
      const encodedText = new TextEncoder().encode(plaintext);
      const jwe = await new CompactEncrypt(encodedText)
        .setProtectedHeader({

          alg: 'dir',
          enc: 'A256GCM',
          ...(context && { kid: context }),
        })
        .encrypt(await this.getActiveCryptoKey());

      return jwe;
    } catch (error) {
      throw error;
    }
  }

  async decrypt(jwe: string, context?: string): Promise<string> {
    if (!jwe) return '';

    const keys = await this.getAllCryptoKeys();
    let lastError: unknown;

    for (const key of keys) {
      try {
        const { plaintext, protectedHeader } = await compactDecrypt(jwe, key);

        // Context binding (AAD-equivalent)
        if (context && protectedHeader.kid !== context) {
          throw new Error('Invalid context');
        }

        return new TextDecoder().decode(plaintext);
      } catch (err) {
        lastError = err;
        continue; // try next rotated key
      }
    }

    // All keys failed
    throw new Error('Decryption failed');
  }
}
