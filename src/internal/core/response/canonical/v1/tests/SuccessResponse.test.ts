import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SuccessResponse } from '../SuccessResponse';

describe('SuccessResponse.toJSON', () => {
  const fixedDate = new Date('2026-01-11T15:44:23.056Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should serialize correctly with no data', () => {
    const res = new SuccessResponse('OK001');
    const json = res.toJSON();

    expect(json).toStrictEqual({
      code: 'OK001',
      message: 'Unknown',
      data: undefined,
      meta: { timestamp: fixedDate.toISOString() },
      protocol: 'canonical.1/success',
    });
  });

  it('should serialize correctly with single object data', () => {
    const data = { id: 1, name: 'Test' };
    const res = new SuccessResponse('OK002', data);
    const json = res.toJSON();

    expect(json).toStrictEqual({
      code: 'OK002',
      message: 'Unknown',
      data,
      meta: { timestamp: fixedDate.toISOString() },
      protocol: 'canonical.1/success',
    });
  });

  it('should serialize correctly with array data', () => {
    const data = [{ id: 1 }, { id: 2 }];
    const res = new SuccessResponse('OK003', data);
    const json = res.toJSON();

    expect(json).toStrictEqual({
      code: 'OK003',
      message: 'Unknown',
      data,
      meta: { timestamp: fixedDate.toISOString() },
      protocol: 'canonical.1/success',
    });
  });

  it('should throw if data violates schema', () => {
    // @ts-expect-error bypass TS to simulate invalid data
    const invalidData = 'string';
    const res = new SuccessResponse('ERR001', invalidData);

    expect(() => res.toJSON()).toThrow();
  });
});
