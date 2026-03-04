import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";
import { z } from "zod";
import { AIMonitorOutput } from "@/types/ai";

const inputSchema = z.object({
  holdings: z.array(
    z.object({
      symbol: z.string(),
      shares: z.number(),
      purchasePrice: z.number(),
      currentPrice: z.number(),
      currentValue: z.number(),
      gainLoss: z.number(),
      gainLossPercent: z.number(),
      name: z.string().optional(),
    })
  ),
  totalValue: z.number(),
  totalGainLossPercent: z.number(),
  chartData: z
    .array(
      z.object({
        date: z.string(),
        portfolioValue: z.number(),
        sp500Value: z.number(),
      })
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = inputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { holdings, totalValue, totalGainLossPercent, chartData } = parsed.data;

  const systemPrompt = `You are a professional stock portfolio monitor. Analyze the portfolio data provided and return a JSON object with this exact structure:
{
  "summary": "string - 2-3 sentence overview",
  "outperformers": [{"symbol": "string", "reason": "string", "gainPercent": number}],
  "underperformers": [{"symbol": "string", "reason": "string", "gainPercent": number}],
  "benchmarkComparison": "string - how portfolio compares to S&P 500",
  "riskFlags": ["string"]
}
Return only valid JSON, no markdown.`;

  const userMessage = `Portfolio Analysis Request:
Total Value: $${totalValue.toFixed(2)}
Total Gain/Loss: ${totalGainLossPercent.toFixed(2)}%

Holdings:
${holdings
  .map(
    (h) =>
      `- ${h.symbol} (${h.name ?? ""}): ${h.shares} shares, purchased at $${h.purchasePrice.toFixed(2)}, now $${h.currentPrice.toFixed(2)}, gain: ${h.gainLossPercent.toFixed(2)}%`
  )
  .join("\n")}

${chartData && chartData.length > 0 ? `Recent performance data available covering ${chartData.length} trading days.` : ""}

Please analyze and return the JSON response.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  let result: AIMonitorOutput;
  try {
    result = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response" },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
