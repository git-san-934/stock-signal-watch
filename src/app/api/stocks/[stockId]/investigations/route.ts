import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { runInvestigation } from "@/features/investigation/server/investigation-orchestrator";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ stockId: string }> },
) {
  const { stockId } = await params;

  const investigations = await prisma.investigation.findMany({
    where: { stockId },
    orderBy: { executedAt: "desc" },
    include: { signals: { include: { evidences: true } } },
  });

  return NextResponse.json(investigations);
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ stockId: string }> },
) {
  const { stockId } = await params;

  try {
    const investigation = await runInvestigation(stockId);
    return NextResponse.json(investigation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "調査の実行に失敗しました" }, { status: 500 });
  }
}
