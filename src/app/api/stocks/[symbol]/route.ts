import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getStockQuote } from "@/lib/yahoo-finance";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { symbol } = await params;

  try {
    const quote = await getStockQuote(symbol.toUpperCase());
    return NextResponse.json(quote);
  } catch {
    return NextResponse.json(
      { error: "Invalid stock symbol or data unavailable" },
      { status: 404 }
    );
  }
}
