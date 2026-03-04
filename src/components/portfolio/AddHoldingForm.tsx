"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Props {
  onAdd: (data: {
    symbol: string;
    shares: number;
    purchasePrice: number;
    purchaseDate: string;
  }) => Promise<void>;
}

export default function AddHoldingForm({ onAdd }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      await onAdd({
        symbol: (formData.get("symbol") as string).toUpperCase(),
        shares: parseFloat(formData.get("shares") as string),
        purchasePrice: parseFloat(formData.get("purchasePrice") as string),
        purchaseDate: formData.get("purchaseDate") as string,
      });
      form.reset();
      setSuccess("Holding added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add holding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Holding</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Ticker Symbol</Label>
              <Input
                id="symbol"
                name="symbol"
                placeholder="AAPL"
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shares">Shares</Label>
              <Input
                id="shares"
                name="shares"
                type="number"
                step="0.000001"
                min="0.000001"
                placeholder="10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.0001"
                min="0.0001"
                placeholder="150.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                name="purchaseDate"
                type="date"
                required
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Holding"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
