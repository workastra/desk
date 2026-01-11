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
  serialize(): Record<string, any> {
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
  toJSON(): z.infer<ReturnType<this["schema"]>> {
    return this.schema().parse(this.serialize()) as z.infer<ReturnType<this["schema"]>>;
  }
}
