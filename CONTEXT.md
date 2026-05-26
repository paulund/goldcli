# Glossary

## Cache
Locally stored API response that avoids redundant network requests. Stored as JSON files under `~/.cache/goldcli/`. Each file contains the response data plus an ISO timestamp (`cachedAt`) for staleness checks. Not a database — just flat JSON files.

## Cache TTL
Time-to-live for cached data. Configurable via `CACHE_MAX_AGE_HOURS` env var (default 24). A cached response is "fresh" if its age is less than the TTL. Set to 0 to disable caching. Applies to the `/latest` endpoint only — timeseries data is cached indefinitely (past prices never change).

## Refresh
CLI flag (`--refresh` / `-f`) that bypasses the cache and fetches fresh data from the API. After the API call completes, the response is written to cache so subsequent non-refresh runs benefit. Not the same as clearing the cache.

## Timeseries
Historical daily metal prices from the metals.dev `/timeseries` endpoint. Because past prices are immutable, this data is fetched once and cached forever. On subsequent runs, the cache is checked for gaps (dates not yet fetched) and only the missing dates are fetched incrementally. Results are pruned to ~366 days to prevent unbounded growth.
