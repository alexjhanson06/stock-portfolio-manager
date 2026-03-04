import { HoldingWithPrice, AllocationTarget, RebalanceSummary } from '@/types/portfolio';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeEquityFraction(
  age: number,
  goal: string,
  riskTolerance: string
): number {
  let base: number;
  if (riskTolerance === 'aggressive') {
    base = clamp(1.00 - age * 0.007, 0.70, 0.95);
  } else if (riskTolerance === 'moderate') {
    base = clamp(0.90 - age * 0.007, 0.50, 0.80);
  } else {
    base = clamp(0.80 - age * 0.010, 0.30, 0.65);
  }

  const goalAdj: Record<string, number> = {
    growth: 0.05,
    balanced: 0,
    income: -0.10,
    preservation: -0.15,
  };

  const adj = goalAdj[goal] ?? 0;
  return clamp(base + adj, 0.20, 0.95);
}

export function computeTargets(
  symbols: string[],
  equityFraction: number
): Record<string, number> {
  if (symbols.length === 0) return {};
  const perSymbol = equityFraction / symbols.length;
  return Object.fromEntries(symbols.map((s) => [s, perSymbol]));
}

export function computeRebalanceSummary(
  holdings: HoldingWithPrice[],
  targets: Record<string, number>,
  equityFraction: number,
  totalValue: number
): RebalanceSummary {
  const allocationTargets: AllocationTarget[] = holdings.map((h) => {
    const targetWeight = targets[h.symbol] ?? 0;
    const currentWeight = totalValue > 0 ? h.currentValue / totalValue : 0;
    const targetValue = totalValue * targetWeight;
    const delta = targetValue - h.currentValue;
    const drift = Math.abs(currentWeight - targetWeight);
    return {
      symbol: h.symbol,
      name: h.name,
      currentWeight,
      targetWeight,
      currentValue: h.currentValue,
      targetValue,
      delta,
      drift,
      hasDrift: drift > 0.05,
    };
  });

  const driftAlerts = allocationTargets.filter((t) => t.hasDrift);
  const bondGapFraction = Math.max(0, 1 - equityFraction);
  const bondGapValue = totalValue * bondGapFraction;
  const totalBuyAmount = allocationTargets
    .filter((t) => t.delta > 0)
    .reduce((sum, t) => sum + t.delta, 0);
  const totalSellAmount = allocationTargets
    .filter((t) => t.delta < 0)
    .reduce((sum, t) => sum + Math.abs(t.delta), 0);

  return {
    allocationTargets,
    driftAlerts,
    equityFraction,
    bondGapFraction,
    bondGapValue,
    totalBuyAmount,
    totalSellAmount,
    totalValue,
  };
}
