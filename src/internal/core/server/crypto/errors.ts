/**
 * Base encryption error class
 */
export class EncryptionError extends Error {
  constructor(
    message: string,
    public readonly algorithm?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'EncryptionError';
  }
}

/**
 * Thrown when decryption fails
 */
export class DecryptionError extends Error {
  constructor(
    message: string,
    public readonly algorithm?: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'DecryptionError';
  }
}

/**
 * Thrown when requested algorithm is not available
 */
export class UnsupportedAlgorithmError extends Error {
  constructor(
    public readonly requestedAlgorithm: string,
    public readonly availableAlgorithms: string[],
  ) {
    super(
      `Unsupported algorithm: ${requestedAlgorithm}. Available: ${availableAlgorithms.join(', ')}`,
    );
    this.name = 'UnsupportedAlgorithmError';
  }
}

/**
 * Thrown when no algorithm is specified and no default exists
 */
export class NoAlgorithmSpecifiedError extends Error {
  constructor(public readonly availableAlgorithms: string[]) {
    super(`No algorithm specified. Available algorithms: ${availableAlgorithms.join(', ')}`);
    this.name = 'NoAlgorithmSpecifiedError';
  }
}

/**
 * Thrown when encryption service has no providers registered
 */
export class NoProvidersError extends Error {
  constructor() {
    super('No encryption providers registered');
    this.name = 'NoProvidersError';
  }
}
