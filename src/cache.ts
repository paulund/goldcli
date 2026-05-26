import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { resolve } from 'path';

const CACHE_DIR = resolve(homedir(), '.cache', 'goldcli');

interface CacheEntry<T> {
  cachedAt: string;
  data: T;
}

function getCacheDir(): string {
  return CACHE_DIR;
}

function cachePath(key: string): string {
  return resolve(getCacheDir(), `${key}.json`);
}

export function getCacheMaxAgeHours(): number {
  const raw = process.env.CACHE_MAX_AGE_HOURS;
  if (!raw) return 24;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : 24;
}

export function isCacheFresh(cachedAt: string, maxAgeHours: number): boolean {
  const age = Date.now() - new Date(cachedAt).getTime();
  return age < maxAgeHours * 3_600_000;
}

export function readCache<T>(key: string): CacheEntry<T> | null {
  const path = cachePath(key);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as CacheEntry<T>;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  mkdirSync(getCacheDir(), { recursive: true });
  const entry: CacheEntry<T> = { cachedAt: new Date().toISOString(), data };
  writeFileSync(cachePath(key), JSON.stringify(entry));
}

export function deleteCache(key: string): void {
  const path = cachePath(key);
  if (existsSync(path)) {
    writeFileSync(path, '');
  }
}
