"use client";

import { HoldingRiskMetric } from "@/types/portfolio";

interface Props {
  holdings: HoldingRiskMetric[];
}

function barColor(vol: number): string {
  if (vol < 0.20) return "bg-emerald-400";
  if (vol < 0.40) return "bg-amber-400";
  return "bg-red-400";
}

function badgeClass(level: 'low' | 'medium' | 'high'): string {
  if (level === 'low')    return "bg-emerald-100 text-emerald-700";
  if (level === 'medium') return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

function badgeLabel(level: 'low' | 'medium' | 'high'): string {
  if (level === 'low')    return "Low Risk";
  if (level === 'medium') return "Med Risk";
  return "High Risk";
}

export default function RiskMeters({ holdings }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Holding Volatility</h2>
      <div className="space-y-4">
        {holdings.map((h) => {
          const barWidth = Math.min(h.annualizedVol / 0.60, 1) * 100;
          return (
            <div key={h.symbol}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-gray-800 text-sm">{h.symbol}</span>
                  {h.name && (
                    <span className="text-xs text-gray-400 truncate">{h.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span className="text-sm text-gray-600">{(h.annualizedVol * 100).toFixed(1)}% vol</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass(h.riskLevel)}`}>
                    {badgeLabel(h.riskLevel)}
                  </span>
                  <span className="text-xs text-gray-400 w-28 text-right">
                    ${h.currentValue.toLocaleString("en-US", { maximumFractionDigits: 0 })} · {(h.weight * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor(h.annualizedVol)}`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-6 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-emerald-400" /> Low (&lt;20%)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-amber-400" /> Medium (20–40%)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full bg-red-400" /> High (&gt;40%)</span>
        <span className="text-gray-400">Bar capped at 60% annualized vol</span>
      </div>
    </div>
  );
}
