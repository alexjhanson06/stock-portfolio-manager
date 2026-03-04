import { unstable_cache } from "next/cache";
import YahooFinance from "yahoo-finance2";
const yahooFinance = new YahooFinance();

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: number;
  name?: string;
}

export interface HistoricalDataPoint {
  date: string;
  close: number;
}

const _cachedGetStockQuote = unstable_cache(
  async (symbol: string): Promise<StockQuote> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote: any = await yahooFinance.quote(symbol, {}, { validateResult: false });

    if (!quote || quote.regularMarketPrice === undefined) {
      console.error("[getStockQuote] Unexpected quote response for", symbol, quote);
      throw new Error(`Invalid stock symbol: ${symbol}`);
    }

    return {
      symbol: quote.symbol as string,
      price: quote.regularMarketPrice as number,
      change: (quote.regularMarketChange as number) ?? 0,
      changePercent: (quote.regularMarketChangePercent as number) ?? 0,
      marketCap: quote.marketCap as number | undefined,
      name: (quote.shortName ?? quote.longName) as string | undefined,
    };
  },
  ["stock-quote"],
  { revalidate: 300 }
);

const _cachedGetHistoricalData = unstable_cache(
  async (symbol: string, startISO: string, endISO: string): Promise<HistoricalDataPoint[]> => {
    const startDate = new Date(startISO);
    const endDate = new Date(endISO);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any[] = await yahooFinance.historical(
      symbol,
      { period1: startDate, period2: endDate, interval: "1d" },
      { validateResult: false }
    );

    return result
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (row: any) => row.close !== null && row.close !== undefined
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => ({
        date: (row.date as Date).toISOString().split("T")[0],
        close: row.close as number,
      }));
  },
  ["historical-data"],
  { revalidate: 3600 }
);

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  return _cachedGetStockQuote(symbol);
}

export async function getHistoricalData(
  symbol: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  return _cachedGetHistoricalData(symbol, startDate.toISOString(), endDate.toISOString());
}
