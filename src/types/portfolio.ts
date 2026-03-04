export interface HoldingWithPrice {
  id: string;
  symbol: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  name?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdingsCount: number;
}

export interface ChartDataPoint {
  date: string;
  portfolioValue: number;
  sp500Value: number;
}
