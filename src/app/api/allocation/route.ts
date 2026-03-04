import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { computeEquityFraction, computeTargets } from '@/lib/allocation';

const planSchema = z.object({
  age: z.number().int().min(18).max(100),
  goal: z.enum(['growth', 'income', 'balanced', 'preservation']),
  riskTolerance: z.enum(['aggressive', 'moderate', 'conservative']),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plan = await prisma.allocationPlan.findUnique({
    where: { userId: session.user.id },
  });

  if (!plan) return NextResponse.json(null);

  return NextResponse.json({
    id: plan.id,
    age: plan.age,
    goal: plan.goal,
    riskTolerance: plan.riskTolerance,
    equityFraction: plan.equityFraction,
    targets: plan.targets,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { age, goal, riskTolerance } = parsed.data;

  const dbHoldings = await prisma.holding.findMany({
    where: { userId: session.user.id },
    select: { symbol: true },
  });
  const symbols = [...new Set(dbHoldings.map((h) => h.symbol))];

  const equityFraction = computeEquityFraction(age, goal, riskTolerance);
  const targets = computeTargets(symbols, equityFraction);

  const plan = await prisma.allocationPlan.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      age,
      goal,
      riskTolerance,
      equityFraction,
      targets,
    },
    update: {
      age,
      goal,
      riskTolerance,
      equityFraction,
      targets,
    },
  });

  return NextResponse.json({
    id: plan.id,
    age: plan.age,
    goal: plan.goal,
    riskTolerance: plan.riskTolerance,
    equityFraction: plan.equityFraction,
    targets: plan.targets,
    createdAt: plan.createdAt.toISOString(),
    updatedAt: plan.updatedAt.toISOString(),
  });
}
