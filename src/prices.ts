import { AssetConfig, PeriodChange, PriceReport, TimeseriesDay } from './types.js';
import { fetchLatest, fetchAllTimeseries } from './metals-api.js';
import { LOOKBACK_PERIODS, resolveAssets } from './config.js';

function fmtDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface PriceMatch {
  price: number;
  date: string;
}

/**
 * Find the price for a metal on or most recently before a target date.
 * Handles weekends and market holidays where data may be absent.
 * Returns both the price and matched date so callers can look up
 * the exchange rate for currency conversion.
 */
function findPrice(
  rates: Record<string, TimeseriesDay>,
  metalKey: string,
  targetDate: Date,
): PriceMatch | undefined {
  const targetStr = fmtDate(targetDate);

  if (rates[targetStr]?.metals[metalKey] !== undefined) {
    return { price: rates[targetStr].metals[metalKey], date: targetStr };
  }

  const dates = Object.keys(rates).sort();
  for (let i = dates.length - 1; i >= 0; i--) {
    if (dates[i] <= targetStr && rates[dates[i]]?.metals[metalKey] !== undefined) {
      return { price: rates[dates[i]].metals[metalKey], date: dates[i] };
    }
  }

  return undefined;
}

/**
 * The timeseries endpoint always returns metals in USD.
 * Convert to the target currency using that day's exchange rate.
 */
function convertFromUsd(usdPrice: number, date: string, rates: Record<string, TimeseriesDay>, currency: string): number {
  const day = rates[date];
  const rate = day?.currencies?.[currency];
  if (!rate) return usdPrice;
  return usdPrice / rate;
}

export async function getPriceReports(assetFilter?: string, currency = 'USD'): Promise<PriceReport[]> {
  const [latest, rates] = await Promise.all([fetchLatest(currency), fetchAllTimeseries(currency)]);

  const assets = resolveAssets(assetFilter);
  const today = new Date();

  return assets.map((asset: AssetConfig) => {
    const currentPrice = latest.metals[asset.apiKey];

    if (currentPrice === undefined) {
      throw new Error(`Price for ${asset.label} (${asset.symbol}) not found in API response`);
    }

    const changes: PeriodChange[] = LOOKBACK_PERIODS.map(({ label, days }) => {
      const target = new Date(today);
      target.setDate(target.getDate() - days);

      const match = findPrice(rates, asset.apiKey, target);

      if (!match) {
        return { label, days, historicalPrice: null, diff: null, percentChange: null };
      }

      const historicalPrice =
        currency !== 'USD' ? convertFromUsd(match.price, match.date, rates, currency) : match.price;

      const diff = currentPrice - historicalPrice;
      const percentChange = (diff / historicalPrice) * 100;

      return { label, days, historicalPrice, diff, percentChange };
    });

    return { name: asset.label, symbol: asset.symbol, currency, currentPrice, changes };
  });
}
