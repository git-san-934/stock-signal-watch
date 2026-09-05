import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { InvestigationDetailView } from "@/features/investigation/components/InvestigationDetailView";

export const dynamic = "force-dynamic";

export default async function InvestigationDetailPage({
  params,
}: {
  params: Promise<{ stockId: string; investigationId: string }>;
}) {
  const { stockId, investigationId } = await params;

  const investigation = await prisma.investigation.findUnique({
    where: { id: investigationId },
    include: { signals: { include: { evidences: true } }, stock: true },
  });

  if (!investigation || investigation.stockId !== stockId) {
    notFound();
  }

  return (
    <InvestigationDetailView
      stockId={stockId}
      stockName={investigation.stock.name}
      investigation={investigation}
    />
  );
}
