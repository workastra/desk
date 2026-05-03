import { cache } from 'react';
import {
  JsonEncryptedDeserializer,
  JsonEncryptedSerializer,
} from '@internal/base/cookie/serializers/encrypted.serializer';
import { dayjs } from '@internal/base/date';
import z from 'zod';
import { defineServerCookie } from '../../../../base/cookie/server';

export const OAuthPkceStateCookie = cache(() => {
  const cookie = defineServerCookie({
    name: '__OAuth2-PKCE',
    schema: z.strictObject({
      codeVerifier: z.string().nonempty(),
      state: z.string().nonempty(),
      nonce: z.string().nonempty(),
      returnTo: z.string().nonempty(),
    }),
    options: {
      path: '/',
      maxAge: dayjs.duration(1, 'minute').asSeconds(),
    },
    serialize: JsonEncryptedSerializer,
    deserialize: JsonEncryptedDeserializer,
  });

  return cookie.asSignal();
});
