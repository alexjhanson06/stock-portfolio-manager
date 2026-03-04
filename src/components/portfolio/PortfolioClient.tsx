"use client";

import { useState, useEffect, useCallback } from "react";
import { HoldingWithPrice } from "@/types/portfolio";
import AddHoldingForm from "./AddHoldingForm";
import HoldingsTable from "./HoldingsTable";

export default function PortfolioClient() {
  const [holdings, setHoldings] = useState<HoldingWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchHoldings = useCallback(async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setHoldings(data);
    } catch {
      setError("Failed to load holdings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const handleAdd = async (data: {
    symbol: string;
    shares: number;
    purchasePrice: number;
    purchaseDate: string;
  }) => {
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to add holding");
    }
    await fetchHoldings();
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? "Failed to delete holding");
    }
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-gray-400">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <AddHoldingForm onAdd={handleAdd} />
      <HoldingsTable holdings={holdings} onDelete={handleDelete} />
    </div>
  );
}
