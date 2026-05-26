import { describe, it, expect } from 'vitest';
import { findPrice, convertFromUsd } from './prices.js';
import type { TimeseriesDay } from './types.js';

function makeDay(price: number, currencyRate?: number): TimeseriesDay {
  return {
    currencies: { USD: 1, ...(currencyRate !== undefined ? { GBP: currencyRate } : {}) },
    date: '',
    metals: { gold: price },
  };
}

const mockRates: Record<string, TimeseriesDay> = {
  '2026-05-25': makeDay(4509.69),
  '2026-05-24': makeDay(4510.0),
  '2026-05-23': makeDay(4490.0),
  '2026-05-18': makeDay(4566.16),
  '2026-04-25': makeDay(4709.75),
  '2025-05-26': makeDay(3342.47),
};

describe('findPrice', () => {
  it('returns exact match when date exists', () => {
    const target = new Date('2026-05-25');
    const result = findPrice(mockRates, 'gold', target);
    expect(result).toEqual({ price: 4509.69, date: '2026-05-25' });
  });

  it('falls back to the nearest prior date when exact match is missing', () => {
    const target = new Date('2026-05-22');
    const result = findPrice(mockRates, 'gold', target);
    expect(result).toEqual({ price: 4566.16, date: '2026-05-18' });
  });

  it('returns undefined when no prior date exists', () => {
    const target = new Date('2024-01-01');
    const result = findPrice(mockRates, 'gold', target);
    expect(result).toBeUndefined();
  });

  it('returns undefined when metal key is not in the data', () => {
    const target = new Date('2026-05-25');
    const result = findPrice(mockRates, 'silver', target);
    expect(result).toBeUndefined();
  });
});

describe('convertFromUsd', () => {
  const rates: Record<string, TimeseriesDay> = {
    '2026-05-25': makeDay(100, 1.35),
  };

  it('converts USD to target currency', () => {
    const result = convertFromUsd(100, '2026-05-25', rates, 'GBP');
    expect(result).toBeCloseTo(74.07, 1);
  });

  it('returns the original price when rate is missing', () => {
    const result = convertFromUsd(100, '2026-05-25', rates, 'EUR');
    expect(result).toBe(100);
  });

  it('returns the original price when date is missing from rates', () => {
    const result = convertFromUsd(100, '2024-01-01', rates, 'GBP');
    expect(result).toBe(100);
  });
});
