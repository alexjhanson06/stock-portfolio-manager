import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Force dynamic rendering so Next.js never caches fetch calls made by yahoo-finance2.
export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getStockQuote } from "@/lib/yahoo-finance";
import { z } from "zod";

const addHoldingSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  shares: z.number().positive(),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const holdings = await prisma.holding.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const enriched = await Promise.all(
    holdings.map(async (h) => {
      try {
        const quote = await getStockQuote(h.symbol);
        const shares = Number(h.shares);
        const purchasePrice = Number(h.purchasePrice);
        const currentValue = shares * quote.price;
        const cost = shares * purchasePrice;
        const gainLoss = currentValue - cost;
        const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

        return {
          id: h.id,
          symbol: h.symbol,
          shares,
          purchasePrice,
          purchaseDate: h.purchaseDate.toISOString().split("T")[0],
          currentPrice: quote.price,
          currentValue,
          gainLoss,
          gainLossPercent,
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

  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = addHoldingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { symbol, shares, purchasePrice, purchaseDate } = parsed.data;

  try {
    await getStockQuote(symbol);
  } catch (err) {
    console.error("[portfolio POST] getStockQuote failed:", err);
    const message = err instanceof Error ? err.message : "Invalid stock symbol";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const holding = await prisma.holding.create({
    data: {
      userId: session.user.id,
      symbol,
      shares,
      purchasePrice,
      purchaseDate: new Date(purchaseDate),
    },
  });

  return NextResponse.json(holding, { status: 201 });
}
