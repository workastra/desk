import { SerializeOptions } from 'cookie';
import { z } from 'zod';

// 1. Codec Strategy: Chịu trách nhiệm biến đổi Data <-> String
// Đây là nơi bạn sẽ plug-in Encryption sau này mà không sửa core logic.
export interface ICookieCodec<T> {
  encode(value: T): Promise<string>;
  decode(value: string): Promise<T | null>;
}

// 2. Storage Strategy: Chịu trách nhiệm Ghi/Đọc thô (Raw String)
// Abstraction này che giấu việc đang chạy ở Server hay Client.
export interface ICookieStorage {
  read(name: string): Promise<string | undefined>;
  write(name: string, value: string, options: SerializeOptions): Promise<void>;
  delete(name: string, options: SerializeOptions): Promise<void>;
}

// 3. Configuration Object
export interface CookieConfig<T> {
  name: string;
  schema: z.ZodType<T>;
  options: SerializeOptions; // Base options
  codec?: ICookieCodec<T>; // Dependency Injection cho Codec
}