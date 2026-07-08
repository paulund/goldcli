#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { getPriceReports } from './prices.js';
import { displayReports } from './format.js';

const program = new Command();

program
  .name('bullion')
  .description('Track precious metal spot prices with historical comparisons')
  .version('1.0.0')
  .option('-a, --asset <name>', 'Asset to check (gold, silver, XAU, XAG). Shows all if omitted.')
  .option('-m, --metal <name>', 'Alias for --asset')
  .option('-c, --currency <code>', 'Currency for prices (e.g. USD, EUR, GBP)', 'USD')
  .parse(process.argv);

const opts = program.opts<{ asset?: string; metal?: string; currency?: string }>();

getPriceReports(opts.asset ?? opts.metal, opts.currency)
  .then(displayReports)
  .catch((err: Error) => {
    console.error(`${chalk.red('Error:')} ${err.message}`);
    process.exit(1);
  });
