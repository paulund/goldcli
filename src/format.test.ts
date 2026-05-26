import { describe, it, expect } from 'vitest';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
};

function formatPrice(value: number | null, currency: string): string {
  if (value === null) return 'N/A';
  const sym = CURRENCY_SYMBOLS[currency];
  return sym ? `${sym}${value.toFixed(2)}` : `${value.toFixed(2)} ${currency}`;
}

function coloredDiff(diff: number | null, currency: string): string {
  if (diff === null) return 'N/A';
  const sym = CURRENCY_SYMBOLS[currency];
  const formatted = sym
    ? `${diff >= 0 ? '+' : ''}${sym}${diff.toFixed(2)}`
    : `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} ${currency}`;
  return formatted;
}

function coloredPct(pct: number | null): string {
  if (pct === null) return 'N/A';
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

describe('formatPrice', () => {
  it('formats USD with $ prefix', () => {
    expect(formatPrice(1234.56, 'USD')).toBe('$1234.56');
  });

  it('formats EUR with \u20AC prefix', () => {
    expect(formatPrice(42.1, 'EUR')).toBe('\u20AC42.10');
  });

  it('formats GBP with \u00A3 prefix', () => {
    expect(formatPrice(99.99, 'GBP')).toBe('\u00A399.99');
  });

  it('formats unknown currencies with code suffix', () => {
    expect(formatPrice(50, 'JPY')).toBe('50.00 JPY');
  });

  it('returns N/A for null value', () => {
    expect(formatPrice(null, 'USD')).toBe('N/A');
  });
});

describe('coloredDiff', () => {
  it('formats positive diff with + prefix', () => {
    const result = coloredDiff(18.18, 'USD');
    expect(result).toContain('+');
    expect(result).toContain('$18.18');
  });

  it('formats negative diff with - prefix', () => {
    const result = coloredDiff(-38.3, 'GBP');
    expect(result).toContain('-');
    expect(result).toContain('\u00A3');
    expect(result).toContain('38.30');
  });

  it('returns N/A for null', () => {
    expect(coloredDiff(null, 'USD')).toBe('N/A');
  });
});

describe('coloredPct', () => {
  it('formats positive percentage with +', () => {
    expect(coloredPct(35.46)).toContain('+35.46%');
  });

  it('formats negative percentage with -', () => {
    expect(coloredPct(-3.86)).toContain('-3.86%');
  });

  it('returns N/A for null', () => {
    expect(coloredPct(null)).toBe('N/A');
  });
});
