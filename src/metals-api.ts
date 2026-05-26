import dotenv from 'dotenv';
import { homedir } from 'os';
import { resolve } from 'path';
import { LatestResponse, TimeseriesDay, TimeseriesResponse } from './types.js';

dotenv.config();
dotenv.config({ path: resolve(homedir(), '.config', 'goldcli', '.env'), override: false });

const BASE_URL = 'https://api.metals.dev/v1';

/**
 * The metals.dev free-tier timeseries endpoint has a 30-day maximum range.
 * Set higher if your plan supports a longer window.
 */
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

export async function fetchLatest(currency = 'USD'): Promise<LatestResponse> {
  const apiKey = getApiKey();
  const url = `${BASE_URL}/latest?api_key=${apiKey}&currency=${currency}&unit=toz`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Latest endpoint error (${res.status}): ${await res.text()}`);
  }

  return res.json() as Promise<LatestResponse>;
}

/**
 * Fetch timeseries data covering the last year.
 *
 * Because the free tier limits each request to 30 days, this method
 * automatically chops the 1-year window into 30‑day chunks and merges
 * the results into a single rates object.
 */
export async function fetchAllTimeseries(currency = 'USD'): Promise<Record<string, TimeseriesDay>> {
  const apiKey = getApiKey();
  const end = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 1);

  const windows: { s: Date; e: Date }[] = [];
  let cur = new Date(start);

  while (cur < end) {
    const winEnd = new Date(cur);
    winEnd.setDate(winEnd.getDate() + MAX_TIMESERIES_RANGE_DAYS - 1);

    if (winEnd >= end) {
      windows.push({ s: cur, e: end });
      break;
    }

    windows.push({ s: cur, e: winEnd });
    cur = new Date(winEnd);
    cur.setDate(cur.getDate() + 1);
  }

  const allRates: Record<string, TimeseriesDay> = {};

  for (const w of windows) {
    const url = `${BASE_URL}/timeseries?api_key=${apiKey}&currency=${currency}&start_date=${fmtDate(w.s)}&end_date=${fmtDate(w.e)}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Timeseries endpoint error (${res.status}): ${await res.text()}`);
    }

    const data = (await res.json()) as TimeseriesResponse;
    Object.assign(allRates, data.rates);
  }

  return allRates;
}
