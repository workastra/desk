import z from 'zod';
import { Response } from '../../Response';
import { CanonicalBaseSchema } from './CanonicalBaseSchema';
import { merge } from 'es-toolkit';

const PaginatedResponseMetaSchema = z.strictObject({
  ...CanonicalBaseSchema.shape.meta.shape,
  pagination: z.strictObject({
    totalPage: z.number().positive(),
    totalRecords: z.number().positive(),
    perPage: z.number().positive(),
    currentPage: z.number().positive(),
  }),
});

/**
 * Generic paginated response.
 */
export class PaginatedResponse<T> extends Response<string> {
  readonly protocol: string = 'canonical.1/pagination';
  readonly #code: string;
  readonly #message: string;
  readonly #data: T[] | undefined;
  readonly #meta: z.infer<typeof PaginatedResponseMetaSchema> | undefined; 

  constructor(code: string, data?: T[], meta?: z.infer<typeof PaginatedResponseMetaSchema>) {
    super();

    this.#code = code;
    this.#message = 'Unknown';
    this.#data = data;
    this.#meta = meta;
  }

  schema() {
    return CanonicalBaseSchema.extend({
      data: z.array(z.unknown()),
      meta: PaginatedResponseMetaSchema,
    });
  }

  override serialize() {
    return merge({
      code: this.#code,
      message: this.#message,
      data: this.#data,
      meta: this.#meta,
    }, super.serialize());
  }
}
