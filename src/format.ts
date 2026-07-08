import chalk from 'chalk';
import Table from 'cli-table3';
import { PriceReport } from './types.js';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
};

/**
 * Pure formatters — testable without chalk.
 */
export function formatPrice(value: number | null, currency: string): string {
  if (value === null) return 'N/A';
  const sym = CURRENCY_SYMBOLS[currency];
  return sym ? `${sym}${value.toFixed(2)}` : `${value.toFixed(2)} ${currency}`;
}

export function formatDiff(diff: number | null, currency: string): string {
  if (diff === null) return 'N/A';
  const sign = diff >= 0 ? '+' : '-';
  const abs = Math.abs(diff).toFixed(2);
  const sym = CURRENCY_SYMBOLS[currency];
  return sym ? `${sign}${sym}${abs}` : `${sign}${abs} ${currency}`;
}

export function formatPct(pct: number | null): string {
  if (pct === null) return 'N/A';
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * Colored wrappers — presentation layer.
 */
export function coloredPrice(value: number | null, currency: string): string {
  const formatted = formatPrice(value, currency);
  return value === null ? chalk.dim(formatted) : chalk.bold(formatted);
}

export function coloredDiff(diff: number | null, currency: string): string {
  const formatted = formatDiff(diff, currency);
  if (diff === null) return chalk.dim(formatted);
  return diff >= 0 ? chalk.green(formatted) : chalk.red(formatted);
}

export function coloredPct(pct: number | null): string {
  const formatted = formatPct(pct);
  if (pct === null) return chalk.dim(formatted);
  return pct >= 0 ? chalk.green(formatted) : chalk.red(formatted);
}

export function displayReports(reports: PriceReport[]): void {
  for (const report of reports) {
    const table = new Table({
      head: [chalk.bold('Period'), chalk.bold('Historical'), chalk.bold('Change'), chalk.bold('% Change')],
      style: { border: ['grey'] },
    });

    for (const c of report.changes) {
      table.push([
        c.label,
        formatPrice(c.historicalPrice, report.currency),
        coloredDiff(c.diff, report.currency),
        coloredPct(c.percentChange),
      ]);
    }

    console.log(`\n${chalk.bold(report.name)} (${chalk.cyan(report.symbol)})`);
    console.log(
      `  ${chalk.underline('Current')} (${report.currency}): ${coloredPrice(report.currentPrice, report.currency)}`,
    );
    console.log(table.toString());
  }
}
