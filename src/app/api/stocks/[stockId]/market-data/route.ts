import { NextResponse } from "next/server";
import { runMarketDataSync } from "@/features/stock-detail/server/market-data-sync";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ stockId: string }> },
) {
  const { stockId } = await params;

  try {
    const data = await runMarketDataSync(stockId);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "株価・財務データの更新に失敗しました" }, { status: 500 });
  }
}
