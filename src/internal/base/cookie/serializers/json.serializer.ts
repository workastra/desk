import { z } from 'zod';

export function JsonSerializer<T>(value: T) {
  return JSON.stringify(value);
}

export async function JsonDeserializer<T>(schema: z.ZodType<T>, value: string): Promise<T> {
  return schema.parseAsync(JSON.parse(value));
}
