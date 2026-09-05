import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const items = await prisma.watchlistItem.findMany({
    include: { stock: true },
    orderBy: { registeredAt: "asc" },
  });

  return NextResponse.json(items.map((item) => item.stock));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { code?: string; name?: string };
  const code = body.code?.trim();
  const name = body.name?.trim();

  if (!code || !name) {
    return NextResponse.json({ error: "code と name は必須です" }, { status: 400 });
  }

  const stock = await prisma.stock.upsert({
    where: { code },
    update: { name },
    create: { code, name },
  });

  const watchlistItem = await prisma.watchlistItem.upsert({
    where: { stockId: stock.id },
    update: {},
    create: { stockId: stock.id },
  });

  return NextResponse.json({ ...stock, registeredAt: watchlistItem.registeredAt }, { status: 201 });
}
