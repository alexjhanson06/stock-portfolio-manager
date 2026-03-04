'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AllocationTarget } from '@/types/portfolio';

interface GapAnalysisProps {
  targets: AllocationTarget[];
}

export default function GapAnalysis({ targets }: GapAnalysisProps) {
  const chartData = targets.map((t) => ({
    symbol: t.symbol,
    Current: +(t.currentWeight * 100).toFixed(1),
    Target: +(t.targetWeight * 100).toFixed(1),
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Current vs Target Allocation</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="symbol" tick={{ fontSize: 12 }} />
          <YAxis unit="%" tick={{ fontSize: 12 }} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip formatter={(value: any) => `${value}%`} />
          <Legend />
          <Bar dataKey="Current" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Target" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
