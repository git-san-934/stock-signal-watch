import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { InvestigationHistoryView } from "@/features/investigation/components/InvestigationHistoryView";

export const dynamic = "force-dynamic";

export default async function InvestigationHistoryPage({
  params,
}: {
  params: Promise<{ stockId: string }>;
}) {
  const { stockId } = await params;

  const stock = await prisma.stock.findUnique({ where: { id: stockId } });
  if (!stock) {
    notFound();
  }

  const investigations = await prisma.investigation.findMany({
    where: { stockId },
    orderBy: { executedAt: "desc" },
    include: { signals: { include: { evidences: true } } },
  });

  return (
    <InvestigationHistoryView
      stockId={stock.id}
      stockName={stock.name}
      investigations={investigations}
    />
  );
}
