"use client";

import React from "react";

interface Props {
  matrix: number[][];
  symbols: string[];
}

function cellBg(r: number): string {
  const clamped = Math.max(-1, Math.min(1, r));
  if (clamped >= 0) {
    const v = Math.round(255 * (1 - clamped));
    return `rgb(255, ${v}, ${v})`;
  } else {
    const v = Math.round(255 * (1 + clamped));
    return `rgb(${v}, ${v}, 255)`;
  }
}

export default function CorrelationHeatmap({ matrix, symbols }: Props) {
  if (symbols.length < 2) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Correlation Heatmap</h2>
        <p className="text-gray-400 text-sm">Add 2+ holdings to see correlation analysis.</p>
      </div>
    );
  }

  const n = symbols.length;
  const cols = n + 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Correlation Heatmap</h2>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))` }}
        >
          {/* Header row */}
          <div className="h-10" /> {/* top-left empty cell */}
          {symbols.map((sym) => (
            <div key={sym} className="h-10 flex items-center justify-center text-xs font-semibold text-gray-600 px-1">
              {sym}
            </div>
          ))}

          {/* Data rows */}
          {symbols.map((rowSym, i) => (
            <React.Fragment key={rowSym}>
              {/* Row label */}
              <div className="h-10 flex items-center justify-end pr-2 text-xs font-semibold text-gray-600">
                {rowSym}
              </div>
              {/* Cells */}
              {symbols.map((colSym, j) => {
                const r = matrix[i][j];
                const bg = cellBg(r);
                const textColor = Math.abs(r) > 0.5 ? "white" : "#374151";
                return (
                  <div
                    key={colSym}
                    className="h-10 flex items-center justify-center text-xs font-medium rounded-sm cursor-default"
                    style={{ backgroundColor: bg, color: textColor }}
                    title={`${rowSym} / ${colSym}: ${r.toFixed(3)}`}
                  >
                    {r.toFixed(2)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Gradient legend */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-xs text-gray-500">−1</span>
        <div
          className="flex-1 h-3 rounded-full"
          style={{ background: "linear-gradient(to right, rgb(0,0,255), rgb(255,255,255), rgb(255,0,0))" }}
        />
        <span className="text-xs text-gray-500">+1</span>
        <span className="text-xs text-gray-400 ml-2">Pearson r (1-year daily returns)</span>
      </div>
    </div>
  );
}
