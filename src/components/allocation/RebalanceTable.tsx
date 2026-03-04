'use client';

import { AllocationTarget } from '@/types/portfolio';
import { formatCurrency } from '@/lib/utils';

interface RebalanceTableProps {
  targets: AllocationTarget[];
  bondGapValue: number;
  totalBuyAmount: number;
  totalSellAmount: number;
}

export default function RebalanceTable({
  targets,
  bondGapValue,
  totalBuyAmount,
  totalSellAmount,
}: RebalanceTableProps) {
  const actionableTargets = targets.filter((t) => Math.abs(t.delta) >= 1);
  const isBalanced = actionableTargets.length === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Rebalancing Plan</h2>

      {isBalanced ? (
        <p className="text-gray-500 text-center py-6">Portfolio is balanced — no action needed.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">Symbol</th>
                  <th className="pb-3 font-medium text-right">Current Value</th>
                  <th className="pb-3 font-medium text-right">Target Value</th>
                  <th className="pb-3 font-medium text-center">Action</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {targets.map((t) => {
                  const abs = Math.abs(t.delta);
                  const isBuy = t.delta > 1;
                  const isSell = t.delta < -1;
                  return (
                    <tr key={t.symbol}>
                      <td className="py-3 font-medium text-gray-900">{t.symbol}</td>
                      <td className="py-3 text-right text-gray-600">
                        {formatCurrency(t.currentValue)}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {formatCurrency(t.targetValue)}
                      </td>
                      <td className="py-3 text-center">
                        {isBuy && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            Buy
                          </span>
                        )}
                        {isSell && (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                            Sell
                          </span>
                        )}
                        {!isBuy && !isSell && (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900">
                        {abs >= 1 ? formatCurrency(abs) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              Total to sell:{' '}
              <span className="font-semibold text-rose-600">{formatCurrency(totalSellAmount)}</span>
            </span>
            <span>·</span>
            <span>
              Total to buy:{' '}
              <span className="font-semibold text-emerald-600">{formatCurrency(totalBuyAmount)}</span>
            </span>
          </div>
        </>
      )}

      {bondGapValue > 100 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <span className="font-semibold">Advisory:</span> Consider adding ~
          {formatCurrency(bondGapValue)} in bonds/fixed income (e.g. BND, AGG) to reach your target
          asset mix.
        </div>
      )}
    </div>
  );
}
