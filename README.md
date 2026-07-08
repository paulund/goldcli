# bullion-cli

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A lightweight CLI tool for tracking precious metal spot prices (Gold, Silver) with historical comparisons across multiple timeframes and currencies. Powered by [bullionapi.dev](https://bullionapi.dev).

> **Status: pre-release.** This package is currently **private on npm** pending the public launch of [bullionapi.dev](https://bullionapi.dev). The CLI is feature-complete and tested, but cannot be installed via `npm install -g` until the API goes live. Track progress at [github.com/PaulundOrg/bullion-api](https://github.com/PaulundOrg/bullion-api).

## Features

- Real-time spot prices for Gold (XAU) and Silver (XAG)
- Historical comparisons: 1 day, 1 week, 1 month, 1 year
- Multi-currency support (USD, EUR, GBP, and more)
- Color-coded output (green for gains, red for losses)
- Clean table formatting with `cli-table3`
- Modular asset architecture — easy to add new assets

## Prerequisites

- **Node.js 18+** (uses native `fetch`)
- A free API key from [bullionapi.dev](https://bullionapi.dev)

## Installation

> **Not yet available via npm.** The package will be published publicly once [bullionapi.dev](https://bullionapi.dev) is live. In the meantime, build from source:

```bash
git clone https://github.com/paulund/bullion-cli.git
cd bullion-cli
npm install
npm run build
npm link
```

### Local development

```bash
git clone https://github.com/paulund/bullion-cli.git
cd bullion-cli
npm install
npm run build
npm link
bullion --help
```

## API Key

Get a free API key at [https://bullionapi.dev](https://bullionapi.dev), then configure it:

```bash
# Option 1 — Set it in your shell profile
export BULLION_API_KEY=your_key_here

# Option 2 — Create ~/.config/bullion/.env
mkdir -p ~/.config/bullion
echo "BULLION_API_KEY=your_key_here" > ~/.config/bullion/.env
```

## Usage

```bash
# Show both Gold and Silver in USD (default)
bullion

# Filter by asset
bullion --asset gold
bullion --asset XAG

# Choose currency
bullion --currency GBP
bullion -c EUR --asset silver

# Short flags
bullion -a gold -c GBP
bullion -m gold          # --metal is alias for --asset

# Help
bullion --help
```

### Example output

```
Gold (XAU)
  Current (USD): $4527.86
┌─────────┬────────────┬───────────┬──────────┐
│ Period  │ Historical │ Change    │ % Change │
├─────────┼────────────┼───────────┼──────────┤
│ 1 Day   │ $4509.69   │ +$18.18   │ +0.40%   │
│ 1 Week  │ $4566.16   │ -$38.30   │ -0.84%   │
│ 1 Month │ $4709.75   │ -$181.89  │ -3.86%   │
│ 1 Year  │ $3342.47   │ +$1185.39 │ +35.46%  │
└─────────┴────────────┴───────────┴──────────┘
```

## Adding new assets

The modular architecture makes it straightforward to add new asset types:

1. Add the asset to [`src/config.ts`](src/config.ts)
2. Wire it through [`src/prices.ts`](src/prices.ts) (if extra logic is needed)

## Configuration

| Variable | Description |
|----------|-------------|
| `BULLION_API_KEY` | Your bullionapi.dev API key (required) |

## Development

```bash
npm install         # install dependencies
npm start           # run with tsx (no build needed)
npm run build       # compile to dist/
npm test            # run tests
npm run lint        # ESLint check
```

## Project structure

```
bullion-cli/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── bullion-client.ts     # HTTP client for bullionapi.dev
│   ├── prices.ts             # Price calculation & conversion
│   ├── config.ts             # Asset definitions
│   ├── types.ts              # TypeScript interfaces
│   └── format.ts             # Terminal output formatting
└── dist/                     # Compiled JS (built by tsc)
```

## How it works

Unlike most price CLIs that hit their data source directly (and burn through API quotas), `bullion-cli` talks to [bullionapi.dev](https://bullionapi.dev), a cached API layer. This means:

- Fast, consistent response times (single round-trip, no client-side chunking)
- No local cache to manage or stale data to worry about
- Your API key's rate limits are centralized

The API contract is pass-through with [metals.dev](https://metals.dev), so response shapes match exactly.

## License

MIT © Paul Underwood (https://github.com/paulund)