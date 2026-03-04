'use client';

import { useState, useEffect } from 'react';
import { AllocationPlanData, HoldingWithPrice, RebalanceSummary } from '@/types/portfolio';
import { computeRebalanceSummary } from '@/lib/allocation';
import GapAnalysis from './GapAnalysis';
import DriftAlerts from './DriftAlerts';
import RebalanceTable from './RebalanceTable';

interface AllocationClientProps {
  initialPlan: AllocationPlanData | null;
  holdings: HoldingWithPrice[];
  totalValue: number;
}

const GOALS = [
  { value: 'growth', label: 'Growth' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'income', label: 'Income' },
  { value: 'preservation', label: 'Preservation' },
] as const;

const RISKS = [
  { value: 'aggressive', label: 'Aggressive' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'conservative', label: 'Conservative' },
] as const;

export default function AllocationClient({
  initialPlan,
  holdings,
  totalValue,
}: AllocationClientProps) {
  const [plan, setPlan] = useState<AllocationPlanData | null>(initialPlan);
  const [summary, setSummary] = useState<RebalanceSummary | null>(null);
  const [formAge, setFormAge] = useState(initialPlan?.age?.toString() ?? '30');
  const [formGoal, setFormGoal] = useState<string>(initialPlan?.goal ?? 'growth');
  const [formRisk, setFormRisk] = useState<string>(initialPlan?.riskTolerance ?? 'moderate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPlan) {
      const s = computeRebalanceSummary(
        holdings,
        initialPlan.targets,
        initialPlan.equityFraction,
        totalValue
      );
      setSummary(s);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(formAge, 10),
          goal: formGoal,
          riskTolerance: formRisk,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to save plan.');
        return;
      }
      const newPlan: AllocationPlanData = await res.json();
      setPlan(newPlan);
      const s = computeRebalanceSummary(
        holdings,
        newPlan.targets,
        newPlan.equityFraction,
        totalValue
      );
      setSummary(s);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const equityPct = plan ? Math.round(plan.equityFraction * 100) : null;
  const bondPct = equityPct !== null ? 100 - equityPct : null;

  return (
    <div className="space-y-6">
      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Investment Profile</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number"
              min={18}
              max={100}
              value={formAge}
              onChange={(e) => setFormAge(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
            <select
              value={formGoal}
              onChange={(e) => setFormGoal(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
            <select
              value={formRisk}
              onChange={(e) => setFormRisk(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              {RISKS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving…' : 'Generate Plan'}
            </button>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
        </form>
      </div>

      {/* Model Allocation */}
      {plan && equityPct !== null && bondPct !== null && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Model Allocation</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium">Equities</span>
                <span className="font-semibold text-violet-600">{equityPct}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${equityPct}%` }}
                />
              </div>
            </div>
            {bondPct > 0 && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">Bonds / Fixed Income</span>
                  <span className="font-semibold text-amber-600">{bondPct}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${bondPct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Bond allocation is advisory — add fixed-income ETFs separately (e.g. BND, AGG).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gap Analysis */}
      {summary && <GapAnalysis targets={summary.allocationTargets} />}

      {/* Drift Alerts */}
      {summary && summary.driftAlerts.length > 0 && (
        <DriftAlerts alerts={summary.driftAlerts} />
      )}

      {/* Rebalance Table */}
      {summary && (
        <RebalanceTable
          targets={summary.allocationTargets}
          bondGapValue={summary.bondGapValue}
          totalBuyAmount={summary.totalBuyAmount}
          totalSellAmount={summary.totalSellAmount}
        />
      )}
    </div>
  );
}
