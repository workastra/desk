import { parseCookie, serialize, SerializeOptions } from 'cookie';
import { ICookieStorage } from '../contracts';

export class DocumentStorage implements ICookieStorage {
  async read(name: string): Promise<string | undefined> {
    return parseCookie(document.cookie)[name];
  }

  async write(name: string, value: string, options: SerializeOptions): Promise<void> {
    document.cookie = serialize(name, value, options);
  }

  async delete(name: string, options: SerializeOptions): Promise<void> {
    // Logic xóa trên browser
    document.cookie = serialize(name, '', { ...options, maxAge: 0 });
  }
}