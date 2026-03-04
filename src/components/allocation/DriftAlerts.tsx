'use client';

import { AllocationTarget } from '@/types/portfolio';

interface DriftAlertsProps {
  alerts: AllocationTarget[];
}

export default function DriftAlerts({ alerts }: DriftAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Drift Alerts</h2>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.symbol}
            className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4"
          >
            <svg
              className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
            <p className="text-sm text-rose-800">
              <span className="font-semibold">{alert.symbol}</span> has drifted{' '}
              <span className="font-semibold">{(alert.drift * 100).toFixed(1)} pp</span> from target
              (current: <span className="font-semibold">{(alert.currentWeight * 100).toFixed(1)}%</span>{' '}
              → target: <span className="font-semibold">{(alert.targetWeight * 100).toFixed(1)}%</span>).
              Consider rebalancing.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
