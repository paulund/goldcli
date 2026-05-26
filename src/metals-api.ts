import dotenv from 'dotenv';
import { homedir } from 'os';
import { resolve } from 'path';
import { LatestResponse, TimeseriesDay, TimeseriesResponse } from './types.js';
import { getCacheMaxAgeHours, readCache, writeCache } from './cache.js';

dotenv.config();
dotenv.config({ path: resolve(homedir(), '.config', 'goldcli', '.env'), override: false });

const BASE_URL = 'https://api.metals.dev/v1';
const MAX_TIMESERIES_RANGE_DAYS = 30;

function getApiKey(): string {
  const key = process.env.METALS_DEV_API_KEY;
  if (!key) {
    console.error('METALS_DEV_API_KEY is not set.');
    console.error('');
    console.error('  Option 1 — Set it in your shell profile (~/.zshrc, ~/.bashrc):');
    console.error('    export METALS_DEV_API_KEY=your_key_here');
    console.error('');
    console.error('  Option 2 — Create ~/.config/goldcli/.env:');
    console.error('    mkdir -p ~/.config/goldcli && echo "METALS_DEV_API_KEY=your_key_here" > ~/.config/goldcli/.env');
    console.error('');
    console.error('  Option 3 — Create a .env file in the current directory.');
    process.exit(1);
  }
  return key;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function fetchLatest(currency = 'USD', refresh = false): Promise<LatestResponse> {
  const maxAgeHours = getCacheMaxAgeHours();
  const cacheKey = `latest-${currency}`;

  if (!refresh && maxAgeHours > 0) {
    const cached = readCache<LatestResponse>(cacheKey);
    if (cached && Date.now() - new Date(cached.cachedAt).getTime() < maxAgeHours * 3_600_000) {
      return cached.data;
    }
  }

  const apiKey = getApiKey();
  const url = `${BASE_URL}/latest?api_key=${apiKey}&currency=${currency}&unit=toz`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Latest endpoint error (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as LatestResponse;

  if (maxAgeHours > 0) {
    writeCache(cacheKey, data);
  }

  return data;
}

function findMissingWindows(
  existing: Record<string, unknown>,
  start: Date,
  end: Date,
): Array<{ start: Date; end: Date }> {
  const windows: Array<{ start: Date; end: Date }> = [];
  let windowStart: Date | null = null;
  const cur = new Date(start);

  while (cur <= end) {
    const key = fmtDate(cur);
    if (!(key in existing)) {
      if (!windowStart) windowStart = new Date(cur);
    } else if (windowStart) {
      windows.push({ start: windowStart, end: new Date(cur.getTime() - 86_400_000) });
      windowStart = null;
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (windowStart) {
    windows.push({ start: windowStart, end });
  }

  return windows;
}

function chunkWindow(start: Date, end: Date): Array<{ start: Date; end: Date }> {
  const chunks: Array<{ start: Date; end: Date }> = [];
  let cur = new Date(start);
  while (cur < end) {
    const chunkEnd = new Date(cur);
    chunkEnd.setDate(chunkEnd.getDate() + MAX_TIMESERIES_RANGE_DAYS - 1);
    if (chunkEnd >= end) {
      chunks.push({ start: cur, end });
      break;
    }
    chunks.push({ start: cur, end: chunkEnd });
    cur = new Date(chunkEnd);
    cur.setDate(cur.getDate() + 1);
  }
  return chunks;
}

async function fetchWindows(
  apiKey: string,
  currency: string,
  windows: Array<{ start: Date; end: Date }>,
): Promise<Record<string, TimeseriesDay>> {
  const rates: Record<string, TimeseriesDay> = {};
  for (const w of windows) {
    const url = `${BASE_URL}/timeseries?api_key=${apiKey}&currency=${currency}&start_date=${fmtDate(w.start)}&end_date=${fmtDate(w.end)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Timeseries endpoint error (${res.status}): ${await res.text()}`);
    }
    const data = (await res.json()) as TimeseriesResponse;
    Object.assign(rates, data.rates);
  }
  return rates;
}

export async function fetchAllTimeseries(currency = 'USD', refresh = false): Promise<Record<string, TimeseriesDay>> {
  const maxAgeHours = getCacheMaxAgeHours();
  const cacheKey = `timeseries-${currency}`;

  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);

  let existing: Record<string, TimeseriesDay> = {};

  if (!refresh && maxAgeHours > 0) {
    const cached = readCache<Record<string, TimeseriesDay>>(cacheKey);
    if (cached) {
      existing = cached.data;
    }
  }

  const missingWindows = findMissingWindows(existing, start, end);

  if (missingWindows.length === 0) {
    return existing;
  }

  const apiKey = getApiKey();
  const allRates: Record<string, TimeseriesDay> = {};

  for (const mw of missingWindows) {
    const chunks = chunkWindow(mw.start, mw.end);
    const chunkRates = await fetchWindows(apiKey, currency, chunks);
    Object.assign(allRates, chunkRates);
  }

  const merged = { ...existing, ...allRates };

  const cutoff = fmtDate(new Date(start.getTime() - 86_400_000));
  const pruned: Record<string, TimeseriesDay> = {};
  for (const [date, val] of Object.entries(merged)) {
    if (date >= cutoff) {
      pruned[date] = val;
    }
  }

  if (maxAgeHours > 0) {
    writeCache(cacheKey, pruned);
  }

  return pruned;
}
