# Glossary

## Cache

Server-side response cache maintained by `bullion-api`. The CLI reads cached latest and historical data through the API; it does not maintain a local price cache.

## Cache TTL

The API owns freshness and refresh cadence. CLI users do not configure a local cache TTL.

## Refresh

The API refreshes upstream data on its scheduled cadence. The CLI only reads the current cached response.

## Timeseries

Historical daily gold prices from the bullion-api `/v1/timeseries` endpoint. The API fetches and caches this data from Twelve Data; the CLI only requests the required date range.
