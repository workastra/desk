import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorResponse } from '../ErrorResponse';

describe('ErrorResponse.toJSON', () => {
  const fixedDate = new Date('2026-01-11T15:44:23.056Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should serialize correctly with no errors', () => {
    const response = new ErrorResponse('ERR001');
    const json = response.toJSON();

    expect(json).toStrictEqual({
      code: 'ERR001',
      message: 'Unknown',
      errors: [],
      meta: { timestamp: fixedDate.toISOString() },
      protocol: 'canonical.1/error',
    });
  });

  it('should serialize correctly with errors', () => {
    const errors = [{ field: 'required' }, { email: 'invalid' }];
    const response = new ErrorResponse('ERR002', errors);
    const json = response.toJSON();

    expect(json).toStrictEqual({
      code: 'ERR002',
      message: 'Unknown',
      errors,
      meta: { timestamp: fixedDate.toISOString() },
      protocol: 'canonical.1/error',
    });
  });

  it('should throw if errors array contains invalid type', () => {
    const invalidErrors = [{ field: 123 }];
    // @ts-expect-error bypass TS to simulate invalid errors
    const response = new ErrorResponse('ERR003', invalidErrors);

    expect(() => response.toJSON()).toThrow();
  });
});
