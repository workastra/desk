import { cookies } from 'next/headers';
import { SerializeOptions } from 'cookie';
import { ICookieStorage } from '../contracts';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { pick } from 'es-toolkit';
import { produce } from 'immer';

export class NextServerStorage implements ICookieStorage {
  get #store(): Promise<ReadonlyRequestCookies> {
    return cookies();
  }

  async read(name: string): Promise<string | undefined> {
    const store = await this.#store;
    const cookie = store.get(name);

    return cookie?.value;
  }

  async write(name: string, value: string, options: SerializeOptions): Promise<void> {
    const store = await this.#store;

    store.set(
      name,
      value,
      pick(
        options,
        ['domain',
          'expires',
          'httpOnly',
          'maxAge',
          'partitioned',
          'path',
          'priority',
          'sameSite',
          'secure',
        ],
      ),
    );
  }

  async delete(name: string, options: SerializeOptions): Promise<void> {
    const store = await this.#store;

    const overridedOptions = produce(pick(options, ['domain',
      'httpOnly',
      'maxAge',
      'partitioned',
      'path',
      'priority',
      'sameSite',
      'secure']), draft => {
      draft.maxAge = 0;
    })

    store.delete({
      name,
      ...overridedOptions,
    });
  }
}