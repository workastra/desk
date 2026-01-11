import { ICookieCodec, ICookieStorage, CookieConfig } from './contracts';
import { JsonCodec } from './codecs/JsonCodec';

// Class đại diện cho nhóm hành vi "Raw" (Get/Set/Remove)
export class RawCookieHandle<T> {
  constructor(
    private storage: ICookieStorage,
    private codec: ICookieCodec<T>,
    private config: CookieConfig<T>
  ) {}

  async get(): Promise<T | null> {
    const raw = await this.storage.read(this.config.name);
    if (!raw) return null;
    return this.codec.decode(raw);
  }

  async set(value: T): Promise<void> {
    const encoded = await this.codec.encode(value);
    await this.storage.write(this.config.name, encoded, this.config.options);
  }

  async remove(): Promise<void> {
    await this.storage.delete(this.config.name, this.config.options);
  }
}

// Class đại diện cho nhóm hành vi "Signal" (Push/Consume)
export class SignalCookieHandle<T> {
  constructor(private rawHandle: RawCookieHandle<T>) {}

  async push(value: T): Promise<void> {
    await this.rawHandle.set(value);
  }

  async consume(): Promise<T | null> {
    const value = await this.rawHandle.get();
    if (value) {
      await this.rawHandle.remove();
    }
    return value;
  }
}

// Main Entity: CookieController
// Giữ nhiệm vụ điều phối và khởi tạo các Handle
export class CookieController<T> {
  private rawHandle: RawCookieHandle<T>;
  private signalHandle: SignalCookieHandle<T>;

  constructor(
    config: CookieConfig<T>,
    storage: ICookieStorage
  ) {
    // Nếu không truyền coder, dùng JsonCodec mặc định -> Open/Closed Principle
    const codec = config.codec || new JsonCodec(config.schema);
    
    this.rawHandle = new RawCookieHandle(storage, codec, config);
    this.signalHandle = new SignalCookieHandle(this.rawHandle);
  }

  asRaw(): RawCookieHandle<T> {
    return this.rawHandle;
  }

  asSignal(): SignalCookieHandle<T> {
    return this.signalHandle;
  }
}