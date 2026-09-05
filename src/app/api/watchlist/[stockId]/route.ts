import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ stockId: string }> },
) {
  const { stockId } = await params;

  await prisma.watchlistItem.deleteMany({ where: { stockId } });

  return new NextResponse(null, { status: 204 });
}
