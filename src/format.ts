import chalk from 'chalk';
import Table from 'cli-table3';
import { PriceReport } from './types.js';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
};

function formatPrice(value: number | null, currency: string): string {
  if (value === null) return chalk.dim('N/A');
  const sym = CURRENCY_SYMBOLS[currency];
  return sym ? `${sym}${value.toFixed(2)}` : `${value.toFixed(2)} ${currency}`;
}

function coloredDiff(diff: number | null, currency: string): string {
  if (diff === null) return chalk.dim('N/A');
  const sym = CURRENCY_SYMBOLS[currency];
  const formatted = sym
    ? `${diff >= 0 ? '+' : ''}${sym}${diff.toFixed(2)}`
    : `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} ${currency}`;
  return diff >= 0 ? chalk.green(formatted) : chalk.red(formatted);
}

function coloredPct(pct: number | null): string {
  if (pct === null) return chalk.dim('N/A');
  const sign = pct >= 0 ? '+' : '';
  const formatted = `${sign}${pct.toFixed(2)}%`;
  return pct >= 0 ? chalk.green(formatted) : chalk.red(formatted);
}

export function displayReports(reports: PriceReport[]): void {
  for (const report of reports) {
    const table = new Table({
      head: [chalk.bold('Period'), chalk.bold('Historical'), chalk.bold('Change'), chalk.bold('% Change')],
      style: { border: ['grey'] },
    });

    for (const c of report.changes) {
      table.push([c.label, formatPrice(c.historicalPrice, report.currency), coloredDiff(c.diff, report.currency), coloredPct(c.percentChange)]);
    }

    console.log(`\n${chalk.bold(report.name)} (${chalk.cyan(report.symbol)})`);
    console.log(`  ${chalk.underline('Current')} (${report.currency}): ${chalk.bold(formatPrice(report.currentPrice, report.currency))}`);
    console.log(table.toString());
  }
}
