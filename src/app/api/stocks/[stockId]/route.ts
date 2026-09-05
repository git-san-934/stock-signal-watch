import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ stockId: string }> },
) {
  const { stockId } = await params;

  const stock = await prisma.stock.findUnique({
    where: { id: stockId },
    include: {
      priceFinancialData: { orderBy: { dataDate: "desc" }, take: 12 },
      investigations: {
        orderBy: { executedAt: "desc" },
        take: 1,
        include: { signals: { include: { evidences: true } } },
      },
    },
  });

  if (!stock) {
    return NextResponse.json({ error: "銘柄が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(stock);
}
