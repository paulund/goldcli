# goldcli — Agent Skill

Use this skill when implementing or extending the [goldcli](https://github.com/paulund/goldcli) CLI tool.

## Overview

goldcli is a CLI tool that tracks precious metal spot prices (Gold, Silver) via the [metals.dev](https://www.metals.dev) API. It fetches the latest price and calculates absolute/percentage differences for 1 day, 1 week, 1 month, and 1 year ago.

## Architecture

```
src/
  index.ts       — Commander CLI entry point
  types.ts       — TypeScript interfaces
  config.ts      — Asset registry + lookback periods
  metals-api.ts  — metals.dev HTTP client (batches timeseries into 30-day windows)
  prices.ts      — Price lookup, currency conversion
  format.ts      — chalk + cli-table3 output
```

## Key design decisions

- **Two API calls per run** — one `/latest`, one batched `/timeseries` for the full year. The free-tier timeseries endpoint has a 30-day max window, so `metals-api.ts` splits the year into 30-day chunks and merges results.
- **Currency conversion** — the timeseries endpoint always returns metals in USD. `prices.ts` converts to the target currency using each day's exchange rate from the `currencies` object.
- **Modular assets** — add a new asset by registering it in `config.ts` and optionally creating a new data-source module. The `getPriceReports` function in `prices.ts` treats all assets uniformly.

## Adding a new asset

1. Add an entry to `SUPPORTED_ASSETS` in `src/config.ts`:
   ```ts
   { id: 'sp500', label: 'S&P 500', symbol: 'SPX', apiKey: 'sp500' },
   ```
2. Create a new API module (e.g. `src/sp500-api.ts`) if the data source differs from metals.dev.
3. Wire the new source into `src/prices.ts`.

## Testing

```bash
npm test             # vitest
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
```

## Common commands

```bash
npm start                  # run locally with tsx
npm run build              # compile to dist/
npm link                   # install goldcli globally
goldcli --asset gold -c EUR
```
