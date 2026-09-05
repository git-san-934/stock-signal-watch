import { prisma } from "@/lib/db/prisma";
import { getSearchProviders } from "@/lib/search-providers";
import { extractSignals } from "@/lib/signal-extraction/extract-signals";

const SEARCH_QUERY_TERMS = "販売数量 販売単価 値上げ 値下げ 売れ行き";

export async function runInvestigation(stockId: string) {
  const stock = await prisma.stock.findUniqueOrThrow({ where: { id: stockId } });

  const investigation = await prisma.investigation.create({
    data: { stockId, status: "running" },
  });

  try {
    const providers = getSearchProviders();
    const query = `${stock.name} ${SEARCH_QUERY_TERMS}`;
    const resultsByProvider = await Promise.all(
      providers.map((provider) => provider.search(query, stock.name)),
    );
    const allResults = resultsByProvider.flat();

    const signals = extractSignals(allResults);

    for (const signal of signals) {
      await prisma.signal.create({
        data: {
          investigationId: investigation.id,
          signalType: signal.signalType,
          direction: signal.direction,
          summary: signal.summary,
          evidences: {
            create: signal.evidences.map((evidence) => ({
              sourceType: evidence.sourceType,
              url: evidence.url,
              title: evidence.title,
              snippet: evidence.snippet,
              publishedAt: evidence.publishedAt,
            })),
          },
        },
      });
    }

    return prisma.investigation.update({
      where: { id: investigation.id },
      data: { status: "completed" },
      include: { signals: { include: { evidences: true } } },
    });
  } catch (error) {
    await prisma.investigation.update({
      where: { id: investigation.id },
      data: { status: "failed" },
    });
    throw error;
  }
}
