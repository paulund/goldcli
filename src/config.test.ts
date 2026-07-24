import { describe, it, expect } from 'vitest';
import { SUPPORTED_ASSETS, LOOKBACK_PERIODS, resolveAssets } from './config.js';

describe('SUPPORTED_ASSETS', () => {
  it('includes gold', () => {
    const ids = SUPPORTED_ASSETS.map((a) => a.id).sort();
    expect(ids).toEqual(['gold']);
  });
});

describe('LOOKBACK_PERIODS', () => {
  it('has 4 periods', () => {
    expect(LOOKBACK_PERIODS).toHaveLength(4);
  });

  it('includes 1 Year', () => {
    expect(LOOKBACK_PERIODS.find((p) => p.days === 365)).toBeDefined();
  });
});

describe('resolveAssets', () => {
  it('returns all assets when no filter', () => {
    expect(resolveAssets()).toHaveLength(1);
  });

  it('filters by id (gold)', () => {
    const result = resolveAssets('gold');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('gold');
  });

  it('filters by symbol (XAU)', () => {
    const result = resolveAssets('XAU');
    expect(result).toHaveLength(1);
    expect(result[0].symbol).toBe('XAU');
  });

  it('throws for unknown asset', () => {
    expect(() => resolveAssets('bitcoin')).toThrow('Unknown asset');
  });
});
