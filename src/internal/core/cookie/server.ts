import 'server-only'; // Force build-time error nếu import sai chỗ
import { CookieController } from './core';
import { NextServerStorage } from './storages/NextServerStorage';
import { CookieConfig } from './contracts';

// Input type cho người dùng (Omit codec vì người dùng chưa cần quan tâm lúc này)
type ServerCookieDefinition<T> = Omit<CookieConfig<T>, 'options' | 'codec'> & {
  options: Omit<CookieConfig<T>['options'], 'httpOnly' | 'secure'>;
  // Future hook cho encryption
  encryption?: CookieConfig<T>['codec']; 
};

export function defineServerCookie<T>(def: ServerCookieDefinition<T>) {
  // Enforce Security Policy: Server Cookie luôn là HttpOnly + Secure
  const strictOptions = {
    ...def.options,
    path: def.options.path || '/',
    httpOnly: true,
    secure: true,
  };

  const config: CookieConfig<T> = {
    name: def.name,
    schema: def.schema,
    options: strictOptions,
    codec: def.encryption, // Inject encryption codec nếu có
  };

  // Dependency Injection: Inject NextServerStorage vào Controller
  return new CookieController(config, new NextServerStorage());
}