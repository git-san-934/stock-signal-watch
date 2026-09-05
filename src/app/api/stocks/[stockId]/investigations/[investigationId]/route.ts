import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ investigationId: string }> },
) {
  const { investigationId } = await params;

  const investigation = await prisma.investigation.findUnique({
    where: { id: investigationId },
    include: { signals: { include: { evidences: true } }, stock: true },
  });

  if (!investigation) {
    return NextResponse.json({ error: "調査が見つかりません" }, { status: 404 });
  }

  return NextResponse.json(investigation);
}
