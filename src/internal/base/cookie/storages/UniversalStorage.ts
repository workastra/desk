import { SerializeOptions } from 'cookie';
import { ICookieStorage } from '../contracts';

export class UniversalStorage implements ICookieStorage {
  #serverStrategy: ICookieStorage;
  #clientStrategy: ICookieStorage;

  constructor(serverStrategy: ICookieStorage, clientStrategy: ICookieStorage) {
    this.#serverStrategy = serverStrategy;
    this.#clientStrategy = clientStrategy;
  }

  private get storage(): ICookieStorage {
    return globalThis.window === undefined ? this.#serverStrategy : this.#clientStrategy;
  }

  async read(name: string): Promise<string | undefined> {
    return this.storage.read(name);
  }

  async write(name: string, value: string, options: SerializeOptions): Promise<void> {
    await this.storage.write(name, value, options);
  }

  async delete(name: string, options: SerializeOptions): Promise<void> {
    await this.storage.delete(name, options);
  }
}
