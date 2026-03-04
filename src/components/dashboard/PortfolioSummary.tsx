import { HoldingWithPrice } from "@/types/portfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  holdings: HoldingWithPrice[];
  totalValue: number;
  totalCost: number;
}

export default function PortfolioSummary({ holdings, totalValue, totalCost }: Props) {
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const isPositive = totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalValue)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalCost)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Gain / Loss</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatCurrency(totalGainLoss)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">Return</p>
          <p
            className={`text-2xl font-bold mt-1 ${
              isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatPercent(totalGainLossPercent)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
