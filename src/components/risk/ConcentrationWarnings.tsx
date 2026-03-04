"use client";

import { ConcentrationWarning } from "@/types/portfolio";

interface Props {
  warnings: ConcentrationWarning[];
}

export default function ConcentrationWarnings({ warnings }: Props) {
  if (warnings.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      {warnings.map((w) => (
        <div
          key={w.symbol}
          className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3"
        >
          <svg
            className="flex-shrink-0 w-5 h-5 text-amber-500 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-amber-800">{w.symbol}</span>
            <span className="text-amber-700">
              {" "}makes up{" "}
              <strong>{(w.weight * 100).toFixed(1)}%</strong> of your portfolio (
              ${w.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}).
            </span>
            <span className="text-amber-600 text-sm ml-1">
              Consider reducing concentration below 10% for better diversification.
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
