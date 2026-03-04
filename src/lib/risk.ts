import { HoldingWithPrice, RiskData, HoldingRiskMetric, ConcentrationWarning } from "@/types/portfolio";
import { HistoricalDataPoint } from "@/lib/yahoo-finance";

export function computeDailyReturns(prices: number[]): number[] {
  if (prices.length < 2) return [];
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
}

export function stddev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function annualizeVol(dailyReturns: number[]): number {
  return stddev(dailyReturns) * Math.sqrt(252);
}

export function pearsonCorrelation(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  if (denA === 0 || denB === 0) return 0;
  return num / Math.sqrt(denA * denB);
}

export function computeHHI(weights: number[]): number {
  return weights.reduce((sum, w) => sum + w * w, 0);
}

export function computeMaxDrawdown(portfolioDailyValues: number[]): number {
  if (portfolioDailyValues.length === 0) return 0;
  let peak = portfolioDailyValues[0];
  let maxDD = 0;
  for (const val of portfolioDailyValues) {
    if (val > peak) peak = val;
    const dd = peak > 0 ? (peak - val) / peak : 0;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

export function computeRiskData(
  holdings: HoldingWithPrice[],
  historicalBySymbol: Record<string, HistoricalDataPoint[]>
): RiskData {
  const symbols = holdings.map((h) => h.symbol);
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  if (holdings.length <= 1 || totalValue === 0) {
    return {
      healthScore: 0,
      diversificationScore: 0,
      volatilityScore: 0,
      drawdownScore: 0,
      hhi: 1,
      annualizedPortfolioVol: 0,
      maxDrawdown: 0,
      holdingRiskMetrics: holdings.map((h) => ({
        symbol: h.symbol,
        name: h.name,
        annualizedVol: 0,
        weight: totalValue > 0 ? h.currentValue / totalValue : 0,
        currentValue: h.currentValue,
        riskLevel: 'low' as const,
      })),
      concentrationWarnings: [],
      symbols,
      correlationMatrix: [[1]],
      insufficientData: true,
    };
  }

  const weights = holdings.map((h) => h.currentValue / totalValue);

  // Find date intersection across all symbols
  const dateSets = symbols.map((sym) => {
    const data = historicalBySymbol[sym] ?? [];
    return new Set(data.map((d) => d.date));
  });
  const allDatesSet = dateSets.reduce((acc, set) => {
    return new Set([...acc].filter((d) => set.has(d)));
  }, dateSets[0] ?? new Set<string>());
  const allDates = [...allDatesSet].sort();

  // Compute aligned daily returns per symbol
  const returnsBySymbol: Record<string, number[]> = {};
  for (const sym of symbols) {
    const data = historicalBySymbol[sym] ?? [];
    const dateToClose = Object.fromEntries(data.map((d) => [d.date, d.close]));
    const prices = allDates.map((d) => dateToClose[d] ?? 0).filter((p) => p > 0);
    returnsBySymbol[sym] = computeDailyReturns(prices);
  }

  // Portfolio daily returns = weighted sum of symbol returns
  const minLen = Math.min(...symbols.map((sym) => returnsBySymbol[sym].length));
  const portfolioReturns: number[] = [];
  for (let i = 0; i < minLen; i++) {
    let r = 0;
    for (let j = 0; j < symbols.length; j++) {
      r += weights[j] * returnsBySymbol[symbols[j]][i];
    }
    portfolioReturns.push(r);
  }

  // Reconstruct portfolio daily values from returns
  const portfolioDailyValues: number[] = [totalValue];
  for (const r of portfolioReturns) {
    portfolioDailyValues.push(portfolioDailyValues[portfolioDailyValues.length - 1] * (1 + r));
  }

  const hhi = computeHHI(weights);
  const annualizedPortfolioVol = annualizeVol(portfolioReturns);
  const maxDrawdown = computeMaxDrawdown(portfolioDailyValues);

  const diversificationScore = (1 - hhi) * 40;
  const volatilityScore = Math.max(0, 35 - (annualizedPortfolioVol / 0.30) * 35);
  const drawdownScore = Math.max(0, 25 - (maxDrawdown / 0.50) * 25);
  const healthScore = Math.round(diversificationScore + volatilityScore + drawdownScore);

  // Per-holding risk metrics
  const holdingRiskMetrics: HoldingRiskMetric[] = holdings.map((h, i) => {
    const vol = annualizeVol(returnsBySymbol[h.symbol] ?? []);
    const riskLevel: 'low' | 'medium' | 'high' =
      vol < 0.20 ? 'low' : vol < 0.40 ? 'medium' : 'high';
    return {
      symbol: h.symbol,
      name: h.name,
      annualizedVol: vol,
      weight: weights[i],
      currentValue: h.currentValue,
      riskLevel,
    };
  });

  // Concentration warnings: weight > 10%
  const concentrationWarnings: ConcentrationWarning[] = holdings
    .map((h, i) => ({ symbol: h.symbol, weight: weights[i], value: h.currentValue }))
    .filter((w) => w.weight > 0.10);

  // Correlation matrix
  const n = symbols.length;
  const correlationMatrix: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      if (i === j) return 1;
      const ra = returnsBySymbol[symbols[i]] ?? [];
      const rb = returnsBySymbol[symbols[j]] ?? [];
      const len = Math.min(ra.length, rb.length);
      return pearsonCorrelation(ra.slice(0, len), rb.slice(0, len));
    })
  );

  return {
    healthScore,
    diversificationScore,
    volatilityScore,
    drawdownScore,
    hhi,
    annualizedPortfolioVol,
    maxDrawdown,
    holdingRiskMetrics,
    concentrationWarnings,
    symbols,
    correlationMatrix,
    insufficientData: false,
  };
}
