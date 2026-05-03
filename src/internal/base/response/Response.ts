import { z } from 'zod';

/**
 * Core abstract Response class
 */
export abstract class Response<Protocol extends string = string> {
  /** The protocol string must always exist */
  abstract readonly protocol: Protocol;

  /** Zod schema contract for serialization and validation */
  abstract schema(): z.ZodTypeAny;

  /** Return the object to be parsed by Zod */
  serialize(): Record<string, unknown> {
    return {
      protocol: this.protocol,
    };
  }

  /**
   * Custom JSON serialization.
   *
   * When JSON.stringify is called on this object, this method
   * will be invoked to control what data gets serialized.
   */
  toJSON(): z.infer<ReturnType<this['schema']>> {
    const schema = this.schema();
    const raw = this.serialize();

    return schema.parse(raw) as z.infer<ReturnType<this['schema']>>;
  }

  /**
   * Returns a native HTTP Response with the given status code.
   *
   * Subclasses may override this to supply a canonical default status,
   * so callers don't have to pass it manually.
   */
  toHttpResponse(status: number): globalThis.Response {
    return globalThis.Response.json(this, { status });
  }
}
