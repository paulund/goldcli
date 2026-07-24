import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchLatest, fetchTimeseries, BullionApiError } from './bullion-client.js';
import type { LatestResponse, TimeseriesResponse } from './types.js';

const sampleLatest: LatestResponse = {
  status: 'success',
  currency: 'USD',
  unit: 'toz',
  metals: { gold: 4527.86 },
  currencies: { USD: 1, EUR: 0.92 },
  timestamps: { metal: '2026-07-08T11:55:00Z', currency: '2026-07-08T11:55:00Z' },
};

const sampleTimeseries: TimeseriesResponse = {
  status: 'success',
  currency: 'USD',
  unit: 'toz',
  start_date: '2025-07-08',
  end_date: '2026-07-08',
  rates: {
    '2026-07-08': { date: '2026-07-08', metals: { gold: 4527.86 }, currencies: { USD: 1 } },
    '2025-07-08': { date: '2025-07-08', metals: { gold: 3342.47 }, currencies: { USD: 1 } },
  },
};

describe('bullion-client', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env.BULLION_API_KEY = 'test-key-123';
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.BULLION_API_KEY;
  });

  describe('fetchLatest', () => {
    it('returns parsed response on 200', async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify(sampleLatest), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      );

      const result = await fetchLatest('USD');
      expect(result).toEqual(sampleLatest);

      const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('api.bullionapi.dev/v1/latest');
      expect(calledUrl).toContain('currency=USD');

      const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
      expect((init.headers as Record<string, string>)['X-API-Key']).toBe('test-key-123');
    });

    it('defaults to USD', async () => {
      fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(sampleLatest), { status: 200 }));
      await fetchLatest();
      const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('currency=USD');
    });

    it('throws friendly error on 401', async () => {
      fetchMock.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));
      await expect(fetchLatest('USD')).rejects.toThrow(/Invalid API key/);
    });

    it('throws BullionApiError instance on 401', async () => {
      fetchMock.mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));
      await expect(fetchLatest('USD')).rejects.toThrow(BullionApiError);
    });

    it('throws friendly error on 429', async () => {
      fetchMock.mockResolvedValueOnce(new Response('Too Many Requests', { status: 429 }));
      await expect(fetchLatest('USD')).rejects.toThrow(/Rate limit/);
    });

    it('throws friendly error on 500', async () => {
      fetchMock.mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 }));
      await expect(fetchLatest('USD')).rejects.toThrow(/temporarily unavailable/);
    });

    it('throws network error on fetch failure', async () => {
      fetchMock.mockRejectedValueOnce(new TypeError('fetch failed'));
      await expect(fetchLatest('USD')).rejects.toThrow(/Could not reach/);
    });
  });

  describe('fetchTimeseries', () => {
    it('returns parsed response on 200', async () => {
      fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(sampleTimeseries), { status: 200 }));

      const result = await fetchTimeseries('USD', '2025-07-08', '2026-07-08');
      expect(result).toEqual(sampleTimeseries);

      const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
      expect(calledUrl).toContain('/v1/timeseries');
      expect(calledUrl).toContain('start_date=2025-07-08');
      expect(calledUrl).toContain('end_date=2026-07-08');
    });

    it('passes through API errors', async () => {
      fetchMock.mockResolvedValueOnce(new Response('Server Error', { status: 500 }));
      await expect(fetchTimeseries('USD', '2025-07-08', '2026-07-08')).rejects.toThrow(/temporarily unavailable/);
    });
  });
});
