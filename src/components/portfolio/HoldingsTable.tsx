"use client";

import { useState } from "react";
import { HoldingWithPrice } from "@/types/portfolio";
import { formatCurrency, formatPercent, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  holdings: HoldingWithPrice[];
  onDelete: (id: string) => Promise<void>;
}

export default function HoldingsTable({ holdings, onDelete }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (holdings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-400">
          No holdings yet. Add your first stock above.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Holdings</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left font-medium text-gray-500">
                  Symbol
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">
                  Shares
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">
                  Buy Price
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">
                  Current Price
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">
                  Value
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">
                  Gain / Loss
                </th>
                <th className="px-6 py-3 text-right font-medium text-gray-500">
                  Date
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => {
                const isPositive = h.gainLoss >= 0;
                return (
                  <tr
                    key={h.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {h.symbol}
                      </div>
                      {h.name && (
                        <div className="text-xs text-gray-400 truncate max-w-[120px]">
                          {h.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {h.shares.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatCurrency(h.purchasePrice)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatCurrency(h.currentPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(h.currentValue)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div
                        className={
                          isPositive ? "text-emerald-600" : "text-red-600"
                        }
                      >
                        {formatCurrency(h.gainLoss)}
                      </div>
                      <div
                        className={`text-xs ${
                          isPositive ? "text-emerald-500" : "text-red-500"
                        }`}
                      >
                        {formatPercent(h.gainLossPercent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500 text-xs">
                      {formatDate(h.purchaseDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(h.id)}
                        disabled={deletingId === h.id}
                      >
                        {deletingId === h.id ? "..." : "Remove"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
