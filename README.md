# goldcli

[![CI](https://github.com/paulund/goldcli/actions/workflows/ci.yml/badge.svg)](https://github.com/paulund/goldcli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A lightweight CLI tool for tracking precious metal spot prices (Gold, Silver) with historical comparisons across multiple timeframes and currencies.

## Features

- Real-time spot prices for Gold (XAU) and Silver (XAG)
- Historical comparisons: 1 day, 1 week, 1 month, 1 year
- Multi-currency support (USD, EUR, GBP, and more)
- Color-coded output (green for gains, red for losses)
- Clean table formatting with `cli-table3`
- Modular asset architecture — easy to add new assets
- 2 API calls per run — respects free-tier limits

## Prerequisites

- **Node.js 18+** (uses native `fetch`)
- A **free API key** from [metals.dev](https://www.metals.dev) (100 requests/month on the free tier)

## Installation

```bash
npm install -g goldcli
```

### Local development

```bash
git clone https://github.com/paulund/goldcli.git
cd goldcli
npm install
npm run build
npm link
goldcli --help
```

### API Key

Copy `.env.example` to `.env` and add your metals.dev API key:

```bash
cp .env.example .env
```

Then edit `.env`:

```
METALS_DEV_API_KEY=your_key_here
```

> ⚠️ Your `.env` file is gitignored and will never be committed.

## Usage

```bash
# Show both Gold and Silver in USD (default)
goldcli

# Filter by asset
goldcli --asset gold
goldcli --asset XAG

# Choose currency
goldcli --currency GBP
goldcli -c EUR --asset silver

# Short flags
goldcli -a gold -c GBP
goldcli -m gold          # --metal is alias for --asset

# Help
goldcli --help
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

The modular architecture makes it straightforward to add new asset types. See the [skills guide](.agents/skills/goldcli/SKILL.md) for agent integration.

1. Create a new data-source module (e.g. `src/yahoo-api.ts` for S&P 500)
2. Register the asset in [`src/config.ts`](src/config.ts)
3. Wire it through [`src/prices.ts`](src/prices.ts)

## Configuration

| Variable | Description |
|----------|-------------|
| `METALS_DEV_API_KEY` | Your metals.dev API key (required) |

## Development

```bash
npm install         # install dependencies
npm start           # run with tsx (no build needed)
npm run build       # compile to dist/
npm test            # run tests
npm run lint        # ESLint check
npm run format      # format with Prettier
npm run typecheck   # TypeScript type check
```

## Project structure

```
goldcli/
├── src/
│   ├── index.ts        # CLI entry point (commander)
│   ├── types.ts        # TypeScript interfaces
│   ├── config.ts       # Asset definitions
│   ├── metals-api.ts   # metals.dev API client
│   ├── prices.ts       # Price calculation & conversion
│   └── format.ts       # Terminal output formatting
├── .github/            # CI, Dependabot, issue templates
├── .agents/            # Agent skills
└── dist/               # Compiled JS (built by tsc)
```

## License

MIT &copy; [Paul Underwood](https://github.com/paulund)
