import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PaginatedResponse } from '../PaginatedResponse';

describe('PaginatedResponse.toJSON', () => {
  const fixedDate = new Date('2026-01-11T15:44:23.056Z');
  const sampleMeta = {
    pagination: {
      totalPage: 1,
      totalRecords: 1,
      perPage: 1,
      currentPage: 1,
    },
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should serialize correctly with empty data and meta', () => {
    const res = new PaginatedResponse('CODE001', [], sampleMeta as any);
    const json = res.toJSON();

    expect(json).toStrictEqual({
      code: 'CODE001',
      message: 'Unknown',
      data: [],
      meta: {
        ...sampleMeta,
        timestamp: fixedDate.toISOString(),
      },
      protocol: 'canonical.1/pagination',
    });
  });

  it('should serialize correctly with data array', () => {
    const data = [{ id: 1 }];
    const res = new PaginatedResponse('CODE002', data, sampleMeta as any);
    const json = res.toJSON();

    expect(json).toStrictEqual({
      code: 'CODE002',
      message: 'Unknown',
      data,
      meta: {
        ...sampleMeta,
        timestamp: fixedDate.toISOString(),
      },
      protocol: 'canonical.1/pagination',
    });
  });

  it('should throw if meta violates schema', () => {
    const invalidMeta = {
      pagination: { totalPage: 0, totalRecords: -1, perPage: 0, currentPage: -1 },
    } as any;
    const res = new PaginatedResponse('CODE003', [], invalidMeta);

    expect(() => res.toJSON()).toThrow();
  });
});
