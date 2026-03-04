import { HoldingWithPrice, ChartDataPoint } from "./portfolio";

export interface AIMonitorInput {
  holdings: HoldingWithPrice[];
  chartData: ChartDataPoint[];
  totalValue: number;
  totalGainLossPercent: number;
}

export interface AIMonitorOutput {
  summary: string;
  outperformers: Array<{
    symbol: string;
    reason: string;
    gainPercent: number;
  }>;
  underperformers: Array<{
    symbol: string;
    reason: string;
    gainPercent: number;
  }>;
  benchmarkComparison: string;
  riskFlags: string[];
}

export interface AIAdvisorOutput {
  overallAssessment: string;
  recommendations: Array<{
    symbol: string;
    action: "BUY" | "SELL" | "HOLD";
    urgency: "HIGH" | "MEDIUM" | "LOW";
    rationale: string;
  }>;
  diversificationInsights: string;
  riskAnalysis: string;
  suggestedAllocations: Array<{
    symbol: string;
    currentPercent: number;
    suggestedPercent: number;
  }>;
}
