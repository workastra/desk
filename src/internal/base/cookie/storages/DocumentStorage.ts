import { SerializeOptions } from 'cookie';
import { pick } from 'es-toolkit';
import { ICookieStorage } from '../contracts';

export class DocumentStorage implements ICookieStorage {
  async read(name: string): Promise<string | undefined> {
    const cookie = await cookieStore.get(name);

    if (cookie === null) {
      return undefined;
    }

    return cookie.value;
  }

  async write(name: string, value: string, options: SerializeOptions): Promise<void> {
    const opts: CookieInit = {
      name,
      value,
      ...pick(options, ['domain', 'partitioned', 'path']),
    };

    if (options.expires === undefined) {
      opts.expires = null;
    }

    if (options.expires instanceof Date) {
      opts.expires = options.expires.getTime();
    }

    if (typeof options.sameSite === 'string') {
      opts.sameSite = options.sameSite;
    }

    return cookieStore.set(opts);
  }

  async delete(name: string, options: SerializeOptions): Promise<void> {
    return cookieStore.delete({
      name,
      ...options,
    });
  }
}
