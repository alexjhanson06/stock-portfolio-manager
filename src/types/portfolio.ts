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

export interface HoldingRiskMetric {
  symbol: string;
  name?: string;
  annualizedVol: number;
  weight: number;
  currentValue: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ConcentrationWarning {
  symbol: string;
  weight: number;
  value: number;
}

export interface RiskData {
  healthScore: number;
  diversificationScore: number;
  volatilityScore: number;
  drawdownScore: number;
  hhi: number;
  annualizedPortfolioVol: number;
  maxDrawdown: number;
  holdingRiskMetrics: HoldingRiskMetric[];
  concentrationWarnings: ConcentrationWarning[];
  symbols: string[];
  correlationMatrix: number[][];
  insufficientData: boolean;
}

export interface AllocationPlanData {
  id: string;
  age: number;
  goal: 'growth' | 'income' | 'balanced' | 'preservation';
  riskTolerance: 'aggressive' | 'moderate' | 'conservative';
  equityFraction: number;
  targets: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface AllocationTarget {
  symbol: string;
  name?: string;
  currentWeight: number;
  targetWeight: number;
  currentValue: number;
  targetValue: number;
  delta: number;
  drift: number;
  hasDrift: boolean;
}

export interface RebalanceSummary {
  allocationTargets: AllocationTarget[];
  driftAlerts: AllocationTarget[];
  equityFraction: number;
  bondGapFraction: number;
  bondGapValue: number;
  totalBuyAmount: number;
  totalSellAmount: number;
  totalValue: number;
}
