export interface LatestResponse {
  status: string;
  currency: string;
  unit: string;
  metals: Record<string, number>;
  currencies: Record<string, number>;
  timestamps: {
    metal: string;
    currency: string;
  };
}

export interface TimeseriesDay {
  currencies: Record<string, number>;
  date: string;
  metals: Record<string, number>;
}

export interface TimeseriesResponse {
  status: string;
  currency: string;
  unit: string;
  start_date: string;
  end_date: string;
  rates: Record<string, TimeseriesDay>;
}

export interface AssetConfig {
  id: string;
  label: string;
  symbol: string;
  apiKey: string;
}

export interface PeriodChange {
  label: string;
  days: number;
  historicalPrice: number | null;
  diff: number | null;
  percentChange: number | null;
}

export interface PriceReport {
  name: string;
  symbol: string;
  currency: string;
  currentPrice: number;
  changes: PeriodChange[];
}
