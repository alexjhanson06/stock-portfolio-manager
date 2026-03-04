import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic } from "@/lib/anthropic";
import { z } from "zod";
import { AIAdvisorOutput } from "@/types/ai";

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

  const { holdings, totalValue, totalGainLossPercent } = parsed.data;

  const systemPrompt = `You are a professional financial advisor. Analyze the portfolio and return a JSON object with this exact structure:
{
  "overallAssessment": "string - 2-3 sentence overall assessment",
  "recommendations": [
    {
      "symbol": "string",
      "action": "BUY" | "SELL" | "HOLD",
      "urgency": "HIGH" | "MEDIUM" | "LOW",
      "rationale": "string - 1-2 sentence explanation"
    }
  ],
  "diversificationInsights": "string - analysis of portfolio diversification",
  "riskAnalysis": "string - risk assessment",
  "suggestedAllocations": [
    {
      "symbol": "string",
      "currentPercent": number,
      "suggestedPercent": number
    }
  ]
}
Return only valid JSON, no markdown. Note: This is for educational purposes only, not financial advice.`;

  const totalCost = holdings.reduce(
    (sum, h) => sum + h.shares * h.purchasePrice,
    0
  );

  const userMessage = `Portfolio Advisor Request:
Total Current Value: $${totalValue.toFixed(2)}
Total Cost Basis: $${totalCost.toFixed(2)}
Overall Gain/Loss: ${totalGainLossPercent.toFixed(2)}%

Holdings breakdown:
${holdings
  .map((h) => {
    const allocation = totalValue > 0 ? (h.currentValue / totalValue) * 100 : 0;
    return `- ${h.symbol} (${h.name ?? ""}): $${h.currentValue.toFixed(2)} (${allocation.toFixed(1)}% of portfolio), ${h.gainLossPercent.toFixed(2)}% gain/loss`;
  })
  .join("\n")}

Please provide investment recommendations (note: for educational purposes only).`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  let result: AIAdvisorOutput;
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
