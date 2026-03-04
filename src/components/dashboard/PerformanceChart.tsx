"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartDataPoint } from "@/types/portfolio";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  data: ChartDataPoint[];
}

export default function PerformanceChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-400">
          Not enough data to display chart.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio vs S&amp;P 500</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
              }}
              minTickGap={60}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                formatCurrency(value as number),
                name === "portfolioValue" ? "Portfolio" : "S&P 500",
              ]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(label: any) =>
                new Date(label as string).toLocaleDateString()
              }
            />
            <Legend
              formatter={(value: string) =>
                value === "portfolioValue" ? "Portfolio" : "S&P 500 (normalized)"
              }
            />
            <Line
              type="monotone"
              dataKey="portfolioValue"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              name="portfolioValue"
            />
            <Line
              type="monotone"
              dataKey="sp500Value"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="sp500Value"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
