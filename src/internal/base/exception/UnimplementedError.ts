export class UnimplementedError extends Error {
  constructor(message = 'Not implemented') {
    super(message);
    this.name = 'UnimplementedError';
  }
}
