import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStockQuote, getHistoricalData } from "@/lib/yahoo-finance";
import Navbar from "@/components/shared/Navbar";
import HealthScore from "@/components/risk/HealthScore";
import ConcentrationWarnings from "@/components/risk/ConcentrationWarnings";
import RiskMeters from "@/components/risk/RiskMeters";
import CorrelationHeatmap from "@/components/risk/CorrelationHeatmap";
import { HoldingWithPrice } from "@/types/portfolio";
import { computeRiskData } from "@/lib/risk";

export const dynamic = "force-dynamic";

export default async function RiskPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const dbHoldings = await prisma.holding.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (dbHoldings.length === 0) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-rose-400 mb-6">Risk Dashboard</h1>
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No holdings yet.</p>
            <p className="text-gray-400 mt-1">
              Go to{" "}
              <a href="/portfolio" className="text-indigo-600 hover:underline">
                Portfolio
              </a>{" "}
              to add your first stock.
            </p>
          </div>
        </main>
      </>
    );
  }

  const symbols = [...new Set(dbHoldings.map((h) => h.symbol))];

  // 1-year lookback for conventional trailing-12-month risk metrics
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const [enriched, historicalResults] = await Promise.all([
    Promise.all(
      dbHoldings.map(async (h): Promise<HoldingWithPrice> => {
        try {
          const quote = await getStockQuote(h.symbol);
          const shares = Number(h.shares);
          const purchasePrice = Number(h.purchasePrice);
          const currentValue = shares * quote.price;
          const cost = shares * purchasePrice;
          const gainLoss = currentValue - cost;
          return {
            id: h.id,
            symbol: h.symbol,
            shares,
            purchasePrice,
            purchaseDate: h.purchaseDate.toISOString().split("T")[0],
            currentPrice: quote.price,
            currentValue,
            gainLoss,
            gainLossPercent: cost > 0 ? (gainLoss / cost) * 100 : 0,
            name: quote.name,
          };
        } catch {
          const shares = Number(h.shares);
          const purchasePrice = Number(h.purchasePrice);
          return {
            id: h.id,
            symbol: h.symbol,
            shares,
            purchasePrice,
            purchaseDate: h.purchaseDate.toISOString().split("T")[0],
            currentPrice: purchasePrice,
            currentValue: shares * purchasePrice,
            gainLoss: 0,
            gainLossPercent: 0,
          };
        }
      })
    ),
    Promise.all(
      symbols.map(async (symbol) => ({
        symbol,
        data: await getHistoricalData(symbol, startDate, endDate).catch(() => []),
      }))
    ),
  ]);

  const historicalBySymbol = Object.fromEntries(
    historicalResults.map(({ symbol, data }) => [symbol, data])
  );

  const riskData = computeRiskData(enriched, historicalBySymbol);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-rose-400 mb-6">Risk Dashboard</h1>
        <HealthScore riskData={riskData} />
        <ConcentrationWarnings warnings={riskData.concentrationWarnings} />
        <div className="mt-6">
          <RiskMeters holdings={riskData.holdingRiskMetrics} />
        </div>
        <div className="mt-6">
          <CorrelationHeatmap matrix={riskData.correlationMatrix} symbols={riskData.symbols} />
        </div>
      </main>
    </>
  );
}
