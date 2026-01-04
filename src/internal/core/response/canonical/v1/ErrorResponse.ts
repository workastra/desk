import z from 'zod';
import { Response } from '../../Response';
import { CanonicalBaseSchema } from './CanonicalBaseSchema';
import { merge } from 'es-toolkit';

/**
 * Generic error response.
 */
export class ErrorResponse extends Response<string> {
    readonly protocol: string = 'canonical.1/error';
    readonly #code: string;
    readonly #message: string;
    readonly #errors: Record<string, string>[] = [];

    constructor(code: string, errors: Record<string, string>[] = []) {
        super();
        this.#code = code;
        this.#errors = errors;
        this.#message = 'Unknown';
    }

    schema() {
        return CanonicalBaseSchema.extend({
            errors: z.array(z.record(z.string(), z.string())).optional(),
        });
    }

    override serialize() {
        return merge({
            code: this.#code,
            message: this.#message,
            errors: this.#errors,
            meta: {},
        }, super.serialize());
    }
}
