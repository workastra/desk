import { UniversalStorage } from './storages/UniversalStorage';
import { NextServerStorage } from './storages/NextServerStorage';
import { DocumentStorage } from './storages/DocumentStorage';
import { CookieConfig } from './contracts';
import { CookieController } from './core';

type BrowserCookieDefinition<T> = Omit<CookieConfig<T>, 'options' | 'codec'> & {
  // Browser cookie không được phép set httpOnly: true từ client
  options: Omit<CookieConfig<T>['options'], 'httpOnly' | 'secure'>;
  encryption?: CookieConfig<T>['codec'];
};

export function defineBrowserCookie<T>(def: BrowserCookieDefinition<T>) {
  // Config logic (giữ nguyên)
  const strictOptions = {
    ...def.options,
    path: def.options.path || '/',
    httpOnly: false, 
    secure: true,   
  };

  const config: CookieConfig<T> = {
    name: def.name,
    schema: def.schema,
    options: strictOptions,
    codec: def.encryption,
  };

  // ASSEMBLE:
  // Chúng ta tạo ra 1 UniversalStorage chứa cả 2 logic.
  // Code không bị lặp lại, mà được tái sử dụng thông qua object instance.
  const storage = new UniversalStorage(
    new NextServerStorage(), // Strategy A
    new DocumentStorage()    // Strategy B
  );

  return new CookieController(config, storage);
}