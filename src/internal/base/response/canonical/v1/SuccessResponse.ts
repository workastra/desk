import { merge } from 'es-toolkit';
import z from 'zod';
import { Response } from '../../Response';
import { CanonicalBaseSchema } from './CanonicalBaseSchema';

/**
 * Generic success response.
 */
export class SuccessResponse<T> extends Response<string> {
  readonly protocol: string = 'canonical.1/success';
  readonly #code: string;
  readonly #message: string;
  readonly #data: T | undefined;

  constructor(code: string, data?: T) {
    super();

    this.#code = code;
    this.#message = 'Unknown';
    this.#data = data;
  }

  schema() {
    return CanonicalBaseSchema.extend({
      data: z
        .union([z.record(z.string(), z.unknown()), z.array(z.record(z.string(), z.unknown()))])
        .exactOptional(),
    });
  }

  override serialize() {
    return merge(
      {
        code: this.#code,
        message: this.#message,
        data: this.#data,
        meta: {},
      },
      super.serialize(),
    );
  }

  override toHttpResponse(status = 200): globalThis.Response {
    return super.toHttpResponse(status);
  }
}
