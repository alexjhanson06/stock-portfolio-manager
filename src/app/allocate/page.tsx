import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getStockQuote } from '@/lib/yahoo-finance';
import Navbar from '@/components/shared/Navbar';
import AllocationClient from '@/components/allocation/AllocationClient';
import { HoldingWithPrice, AllocationPlanData } from '@/types/portfolio';

export const dynamic = 'force-dynamic';

export default async function AllocatePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/login');

  const dbHoldings = await prisma.holding.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  if (dbHoldings.length === 0) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-violet-400 mb-6">Smart Allocation Planner</h1>
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No holdings yet.</p>
            <p className="text-gray-400 mt-1">
              Go to{' '}
              <a href="/portfolio" className="text-indigo-600 hover:underline">
                Portfolio
              </a>{' '}
              to add your first stock before using the planner.
            </p>
          </div>
        </main>
      </>
    );
  }

  const [enriched, savedPlan] = await Promise.all([
    Promise.all(
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
            purchaseDate: h.purchaseDate.toISOString().split('T')[0],
            currentPrice: quote.price,
            currentValue,
            gainLoss,
            gainLossPercent: cost > 0 ? (gainLoss / cost) * 100 : 0,
            name: quote.name,
          } satisfies HoldingWithPrice;
        } catch {
          const shares = Number(h.shares);
          const purchasePrice = Number(h.purchasePrice);
          return {
            id: h.id,
            symbol: h.symbol,
            shares,
            purchasePrice,
            purchaseDate: h.purchaseDate.toISOString().split('T')[0],
            currentPrice: purchasePrice,
            currentValue: shares * purchasePrice,
            gainLoss: 0,
            gainLossPercent: 0,
          } satisfies HoldingWithPrice;
        }
      })
    ),
    prisma.allocationPlan.findUnique({ where: { userId: session.user.id } }),
  ]);

  const totalValue = enriched.reduce((sum: number, h: HoldingWithPrice) => sum + h.currentValue, 0);

  const initialPlan: AllocationPlanData | null = savedPlan
    ? {
        id: savedPlan.id,
        age: savedPlan.age,
        goal: savedPlan.goal as AllocationPlanData['goal'],
        riskTolerance: savedPlan.riskTolerance as AllocationPlanData['riskTolerance'],
        equityFraction: savedPlan.equityFraction,
        targets: savedPlan.targets as Record<string, number>,
        createdAt: savedPlan.createdAt.toISOString(),
        updatedAt: savedPlan.updatedAt.toISOString(),
      }
    : null;

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-violet-400 mb-6">Smart Allocation Planner</h1>
        <AllocationClient
          initialPlan={initialPlan}
          holdings={enriched}
          totalValue={totalValue}
        />
      </main>
    </>
  );
}
