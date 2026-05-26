import { AssetConfig } from './types.js';

export const SUPPORTED_ASSETS: AssetConfig[] = [
  { id: 'gold', label: 'Gold', symbol: 'XAU', apiKey: 'gold' },
  { id: 'silver', label: 'Silver', symbol: 'XAG', apiKey: 'silver' },
];

export const LOOKBACK_PERIODS = [
  { label: '1 Day', days: 1 },
  { label: '1 Week', days: 7 },
  { label: '1 Month', days: 30 },
  { label: '1 Year', days: 365 },
];

export function resolveAssets(filter?: string): AssetConfig[] {
  if (!filter) return SUPPORTED_ASSETS;

  const match = SUPPORTED_ASSETS.find(
    (a) =>
      a.id === filter.toLowerCase() ||
      a.symbol === filter.toUpperCase() ||
      a.label.toLowerCase() === filter.toLowerCase(),
  );

  if (!match) {
    const available = SUPPORTED_ASSETS.map((a) => `${a.symbol} (${a.label})`).join(', ');
    throw new Error(`Unknown asset "${filter}". Available: ${available}`);
  }

  return [match];
}
