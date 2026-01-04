import { ICookieStorage } from '../contracts';
import { SerializeOptions } from 'cookie';

export class UniversalStorage implements ICookieStorage {
  // Dependency Injection: Nhận vào 2 implementations thực tế
  constructor(
    private serverStrategy: ICookieStorage,
    private clientStrategy: ICookieStorage
  ) {}

  // Helper private để check runtime
  private get isServer(): boolean {
    return typeof window === 'undefined';
  }

  // Delegate: "Nếu là server, nhờ ông Server làm. Nếu là client, nhờ ông Client làm."
  async read(name: string): Promise<string | undefined> {
    if (this.isServer) {
      return this.serverStrategy.read(name);
    }
    return this.clientStrategy.read(name);
  }

  async write(name: string, value: string, options: SerializeOptions): Promise<void> {
    if (this.isServer) {
      await this.serverStrategy.write(name, value, options);
    } else {
      await this.clientStrategy.write(name, value, options);
    }
  }

  async delete(name: string, options: SerializeOptions): Promise<void> {
    if (this.isServer) {
      await this.serverStrategy.delete(name, options);
    } else {
      await this.clientStrategy.delete(name, options);
    }
  }
}