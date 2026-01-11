import z from "zod";
import { dayjs } from "@internal/core/date";
import { defineServerCookie } from "../../../core/cookie/server";

export const OAuthPkceStateCookie = defineServerCookie({
  name: '__Host-OAuth2-PKCE',
  schema: z.object({
    codeVerifier: z.string().nonempty(),
    state: z.string().nonempty(),
    nonce: z.string().nonempty(),
  }),
  options: {
    path: '/',
    maxAge: dayjs.duration(1, 'minute').asSeconds(),
  },
}).asSignal();
