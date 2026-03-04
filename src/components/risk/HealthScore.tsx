"use client";

import { RiskData } from "@/types/portfolio";

interface Props {
  riskData: RiskData;
}

function scoreColor(score: number): string {
  if (score >= 75) return "emerald";
  if (score >= 50) return "cyan";
  if (score >= 25) return "amber";
  return "red";
}

function scoreLabel(score: number): string {
  if (score >= 75) return "Excellent";
  if (score >= 50) return "Good";
  if (score >= 25) return "Fair";
  return "Poor";
}

const colorMap: Record<string, { ring: string; text: string; bg: string }> = {
  emerald: { ring: "border-emerald-400", text: "text-emerald-400", bg: "bg-emerald-50" },
  cyan:    { ring: "border-cyan-400",    text: "text-cyan-400",    bg: "bg-cyan-50" },
  amber:   { ring: "border-amber-400",   text: "text-amber-400",   bg: "bg-amber-50" },
  red:     { ring: "border-red-400",     text: "text-red-400",     bg: "bg-red-50" },
};

export default function HealthScore({ riskData }: Props) {
  const { healthScore, diversificationScore, volatilityScore, drawdownScore, hhi, annualizedPortfolioVol, maxDrawdown, insufficientData } = riskData;
  const color = scoreColor(healthScore);
  const { ring, text, bg } = colorMap[color];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Portfolio Health Score</h2>

      {insufficientData && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
          Add 2+ holdings with historical data for a full risk analysis.
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Score circle */}
        <div className={`flex-shrink-0 w-36 h-36 rounded-full border-8 ${ring} flex flex-col items-center justify-center ${bg}`}>
          <span className={`text-4xl font-bold ${text}`}>{healthScore}</span>
          <span className={`text-sm font-medium ${text}`}>{scoreLabel(healthScore)}</span>
        </div>

        {/* Sub-scores */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Diversification</div>
            <div className="text-2xl font-bold text-gray-800">{diversificationScore.toFixed(1)}<span className="text-sm font-normal text-gray-400">/40</span></div>
            <div className="text-xs text-gray-500 mt-1">HHI: {hhi.toFixed(3)}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Volatility</div>
            <div className="text-2xl font-bold text-gray-800">{volatilityScore.toFixed(1)}<span className="text-sm font-normal text-gray-400">/35</span></div>
            <div className="text-xs text-gray-500 mt-1">Ann. vol: {(annualizedPortfolioVol * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Drawdown</div>
            <div className="text-2xl font-bold text-gray-800">{drawdownScore.toFixed(1)}<span className="text-sm font-normal text-gray-400">/25</span></div>
            <div className="text-xs text-gray-500 mt-1">Max DD: {(maxDrawdown * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
