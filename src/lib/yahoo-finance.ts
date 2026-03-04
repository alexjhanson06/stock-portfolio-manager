import yahooFinance from "yahoo-finance2";

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

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quote: any = await yahooFinance.quote(symbol);

  if (!quote || quote.regularMarketPrice === undefined) {
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
}

export async function getHistoricalData(
  symbol: string,
  startDate: Date,
  endDate: Date
): Promise<HistoricalDataPoint[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any[] = await yahooFinance.historical(symbol, {
    period1: startDate,
    period2: endDate,
    interval: "1d",
  });

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
}
