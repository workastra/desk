import { decrypt, encrypt } from '@internal/base/crypto';
import { z } from 'zod';

export function JsonEncryptedSerializer<T>(value: T) {
  return encrypt(JSON.stringify(value));
}

export async function JsonEncryptedDeserializer<T>(
  schema: z.ZodType<T>,
  value: string,
): Promise<T> {
  const decryptedValue = await decrypt(value);

  return schema.parseAsync(JSON.parse(decryptedValue));
}
