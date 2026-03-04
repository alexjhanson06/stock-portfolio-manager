"use client";

import { useState } from "react";
import { HoldingWithPrice } from "@/types/portfolio";
import { AIMonitorOutput, AIAdvisorOutput } from "@/types/ai";
import { Button } from "@/components/ui/button";
import MonitorReport from "./MonitorReport";
import AdvisorReport from "./AdvisorReport";

export default function InsightsClient() {
  const [holdings, setHoldings] = useState<HoldingWithPrice[] | null>(null);
  const [monitorResult, setMonitorResult] = useState<AIMonitorOutput | null>(null);
  const [advisorResult, setAdvisorResult] = useState<AIAdvisorOutput | null>(null);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadHoldings(): Promise<HoldingWithPrice[]> {
    if (holdings) return holdings;
    const res = await fetch("/api/portfolio");
    if (!res.ok) throw new Error("Failed to load portfolio");
    const data = await res.json();
    setHoldings(data);
    return data;
  }

  async function runMonitor() {
    setError("");
    setMonitorLoading(true);
    try {
      const data = await loadHoldings();
      if (data.length === 0) {
        setError("Add holdings to your portfolio first.");
        return;
      }
      const totalValue = data.reduce((s, h) => s + h.currentValue, 0);
      const totalCost = data.reduce((s, h) => s + h.shares * h.purchasePrice, 0);
      const totalGainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

      const res = await fetch("/api/ai/monitor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: data, totalValue, totalGainLossPercent }),
      });
      if (!res.ok) throw new Error("Monitor agent failed");
      setMonitorResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Monitor failed");
    } finally {
      setMonitorLoading(false);
    }
  }

  async function runAdvisor() {
    setError("");
    setAdvisorLoading(true);
    try {
      const data = await loadHoldings();
      if (data.length === 0) {
        setError("Add holdings to your portfolio first.");
        return;
      }
      const totalValue = data.reduce((s, h) => s + h.currentValue, 0);
      const totalCost = data.reduce((s, h) => s + h.shares * h.purchasePrice, 0);
      const totalGainLossPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings: data, totalValue, totalGainLossPercent }),
      });
      if (!res.ok) throw new Error("Advisor agent failed");
      setAdvisorResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Advisor failed");
    } finally {
      setAdvisorLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Portfolio Monitor</h2>
          <p className="text-sm text-gray-500 mb-4">
            Analyze performance, identify top movers, and flag risks.
          </p>
          <Button onClick={runMonitor} disabled={monitorLoading}>
            {monitorLoading ? "Analyzing..." : "Run Monitor"}
          </Button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Portfolio Advisor</h2>
          <p className="text-sm text-gray-500 mb-4">
            Get BUY/SELL/HOLD recommendations and allocation suggestions.
          </p>
          <Button onClick={runAdvisor} disabled={advisorLoading} variant="outline">
            {advisorLoading ? "Generating advice..." : "Get Advice"}
          </Button>
        </div>
      </div>

      {monitorResult && <MonitorReport report={monitorResult} />}
      {advisorResult && <AdvisorReport report={advisorResult} />}
    </div>
  );
}
