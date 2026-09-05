import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { StockDetailView } from "@/features/stock-detail/components/StockDetailView";

export const dynamic = "force-dynamic";

export default async function StockDetailPage({
  params,
}: {
  params: Promise<{ stockId: string }>;
}) {
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
    notFound();
  }

  return <StockDetailView stock={stock} />;
}
