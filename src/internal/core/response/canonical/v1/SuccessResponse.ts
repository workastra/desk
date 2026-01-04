import z from 'zod';
import { Response } from '../../Response';
import { CanonicalBaseSchema } from './CanonicalBaseSchema';
import { merge } from 'es-toolkit';

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
            data: z.object().or(z.array(z.unknown())).exactOptional(),
        });
    }

    override serialize() {
        return merge({
            code: this.#code,
            message: this.#message,
            data: this.#data,
            meta: {},
        }, super.serialize());
    }
}
