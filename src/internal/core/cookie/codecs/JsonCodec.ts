import { z } from 'zod';
import { ICookieCodec } from '../contracts';

export class JsonCodec<T> implements ICookieCodec<T> {
  constructor(private schema: z.ZodType<T>) {}

  async encode(value: T): Promise<string> {
    const parsed = this.schema.parse(value);
    return JSON.stringify(parsed);
  }

  async decode(value: string): Promise<T | null> {
    try {
      const json = JSON.parse(value);
      // Validate data in-coming để đảm bảo type-safe
      return this.schema.parse(json);
    } catch {
      return null;
    }
  }
}