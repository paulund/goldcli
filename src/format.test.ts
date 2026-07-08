import { describe, it, expect } from 'vitest';
import { formatPrice, formatDiff, formatPct } from './format.js';

describe('formatPrice', () => {
  it('formats USD with $ prefix', () => {
    expect(formatPrice(1234.56, 'USD')).toBe('$1234.56');
  });

  it('formats EUR with € prefix', () => {
    expect(formatPrice(42.1, 'EUR')).toBe('\u20AC42.10');
  });

  it('formats GBP with £ prefix', () => {
    expect(formatPrice(99.99, 'GBP')).toBe('\u00A399.99');
  });

  it('formats unknown currencies with code suffix', () => {
    expect(formatPrice(50, 'JPY')).toBe('50.00 JPY');
  });

  it('returns N/A for null value', () => {
    expect(formatPrice(null, 'USD')).toBe('N/A');
  });
});

describe('formatDiff', () => {
  it('formats positive diff with + prefix', () => {
    expect(formatDiff(18.18, 'USD')).toBe('+$18.18');
  });

  it('formats negative diff with - prefix (no explicit minus — sign is on the number)', () => {
    expect(formatDiff(-38.3, 'GBP')).toBe('-\u00A338.30');
  });

  it('returns N/A for null', () => {
    expect(formatDiff(null, 'USD')).toBe('N/A');
  });
});

describe('formatPct', () => {
  it('formats positive percentage with +', () => {
    expect(formatPct(35.46)).toBe('+35.46%');
  });

  it('formats negative percentage (sign comes from the number)', () => {
    expect(formatPct(-3.86)).toBe('-3.86%');
  });

  it('returns N/A for null', () => {
    expect(formatPct(null)).toBe('N/A');
  });
});
