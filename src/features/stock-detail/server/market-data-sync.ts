import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { fetchLatestStockPrice } from "@/lib/market-data/jquants-client";
import { findRecentDisclosures } from "@/lib/market-data/edinet-client";

function todayAtMidnight(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export async function runMarketDataSync(stockId: string) {
  const stock = await prisma.stock.findUniqueOrThrow({ where: { id: stockId } });

  const [price, disclosures] = await Promise.all([
    fetchLatestStockPrice(stock.code),
    findRecentDisclosures(stock.code),
  ]);

  const dataDate = todayAtMidnight();
  const disclosureDocumentsJson = disclosures as unknown as Prisma.InputJsonValue;

  return prisma.priceFinancialData.upsert({
    where: { stockId_dataDate: { stockId, dataDate } },
    // On update, only overwrite a field when this run produced a fresh
    // value — a transient failure shouldn't blank out data fetched earlier.
    update: {
      ...(price ? { price: price.close, priceSource: "jquants" } : {}),
      ...(disclosures.length > 0
        ? { disclosureDocuments: disclosureDocumentsJson, disclosureSource: "edinet" }
        : {}),
    },
    create: {
      stockId,
      dataDate,
      price: price?.close ?? null,
      priceSource: price ? "jquants" : null,
      disclosureDocuments: disclosures.length > 0 ? disclosureDocumentsJson : undefined,
      disclosureSource: disclosures.length > 0 ? "edinet" : undefined,
    },
  });
}
