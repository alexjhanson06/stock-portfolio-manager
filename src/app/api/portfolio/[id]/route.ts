import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const DELETE = auth(async function DELETE(req, ctx) {
  if (!req.auth?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await (ctx as { params: Promise<{ id: string }> }).params;

  try {
    const holding = await prisma.holding.findFirst({
      where: { id, userId: req.auth.user.id },
    });

    if (!holding) {
      return NextResponse.json({ error: "Holding not found" }, { status: 404 });
    }

    await prisma.holding.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[portfolio DELETE]", err);
    return NextResponse.json({ error: "Failed to delete holding" }, { status: 500 });
  }
});
