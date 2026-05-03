export class UnauthenticationError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'UnauthenticationError';
  }
}
