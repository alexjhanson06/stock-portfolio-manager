import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getStockQuote, getHistoricalData } from "@/lib/yahoo-finance";
import Navbar from "@/components/shared/Navbar";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import { ChartDataPoint, HoldingWithPrice } from "@/types/portfolio";

export const dynamic = "force-dynamic";

function DashboardSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
        ))}
      </div>
      <div className="mt-8 bg-gray-100 rounded-2xl h-80 animate-pulse" />
    </main>
  );
}

async function DashboardContent({ userId }: { userId: string }) {
  const dbHoldings = await prisma.holding.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (dbHoldings.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-cyan-400 mb-6">Dashboard</h1>
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
    );
  }

  // Determine date range
  const earliest = dbHoldings.reduce((min, h) => {
    const d = new Date(h.purchaseDate);
    return d < min ? d : min;
  }, new Date(dbHoldings[0].purchaseDate));

  const endDate = new Date();

  // Fetch historical data for all unique symbols + S&P 500
  const symbols = [...new Set(dbHoldings.map((h) => h.symbol))];

  const [historicalBySymbol, sp500Data] = await Promise.all([
    Promise.all(
      symbols.map(async (symbol) => ({
        symbol,
        data: await getHistoricalData(symbol, earliest, endDate).catch(
          () => []
        ),
      }))
    ),
    getHistoricalData("^GSPC", earliest, endDate).catch(() => []),
  ]);

  const historicalMap = Object.fromEntries(
    historicalBySymbol.map(({ symbol, data }) => [symbol, data])
  );

  // Get all unique dates from S&P 500 data
  const dates = sp500Data.map((d) => d.date);

  // Compute daily portfolio value
  const portfolioByDate: Record<string, number> = {};
  for (const date of dates) {
    let dayValue = 0;
    for (const holding of dbHoldings) {
      const purchaseDate = holding.purchaseDate.toISOString().split("T")[0];
      if (date < purchaseDate) continue;
      const symbolData = historicalMap[holding.symbol] ?? [];
      const dayData = symbolData.find((d) => d.date === date);
      if (dayData) {
        dayValue += Number(holding.shares) * dayData.close;
      }
    }
    portfolioByDate[date] = dayValue;
  }

  // Normalize S&P 500 to portfolio start value
  const firstPortfolioValue =
    Object.values(portfolioByDate).find((v) => v > 0) ?? 1;
  const firstSp500 = sp500Data[0]?.close ?? 1;

  const chartData: ChartDataPoint[] = dates
    .filter((d) => portfolioByDate[d] > 0)
    .map((date) => {
      const sp500Row = sp500Data.find((d) => d.date === date);
      const sp500Normalized = sp500Row
        ? (sp500Row.close / firstSp500) * firstPortfolioValue
        : 0;
      return {
        date,
        portfolioValue: portfolioByDate[date],
        sp500Value: sp500Normalized,
      };
    });

  // Enrich holdings with live prices
  const enriched: HoldingWithPrice[] = await Promise.all(
    dbHoldings.map(async (h) => {
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
  );

  const totalValue = enriched.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = enriched.reduce(
    (sum, h) => sum + h.shares * h.purchasePrice,
    0
  );

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-cyan-400 mb-6">Dashboard</h1>
      <PortfolioSummary holdings={enriched} totalValue={totalValue} totalCost={totalCost} />
      <div className="mt-8">
        <PerformanceChart data={chartData} />
      </div>
    </main>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  return (
    <>
      <Navbar />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={session.user.id} />
      </Suspense>
    </>
  );
}
