import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const EDINET_BASE_URL = "https://api.edinet-fsa.go.jp/api/v2";
const DEFAULT_LOOKBACK_DAYS = 30;

export interface DisclosureDocument {
  docId: string;
  filerName: string;
  docDescription: string;
  docTypeCode: string;
  submittedAt: string;
}

interface RawEdinetDocument {
  docID: string;
  secCode: string | null;
  filerName: string;
  docDescription: string | null;
  docTypeCode: string | null;
  submitDateTime: string;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function fetchDocumentsForDate(dateKey: string): Promise<RawEdinetDocument[] | null> {
  const subscriptionKey = process.env.EDINET_SUBSCRIPTION_KEY;
  if (!subscriptionKey) {
    return null;
  }

  try {
    const url = new URL(`${EDINET_BASE_URL}/documents.json`);
    url.searchParams.set("date", dateKey);
    url.searchParams.set("type", "2");
    url.searchParams.set("Subscription-Key", subscriptionKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`EDINET documents.json returned status ${response.status}`);
    }

    const data = (await response.json()) as { results?: RawEdinetDocument[] };
    return data.results ?? [];
  } catch (error) {
    console.error(`EDINET fetchDocumentsForDate(${dateKey}) failed`, error);
    return null;
  }
}

/**
 * EDINET has no company/code search endpoint — its document list is only
 * queryable per calendar date (see docs/architecture.md, "技術的制約と要件").
 * Each day's full list is identical for every stock, so we cache it once per
 * date in `EdinetDailyDocuments` and reuse it across stocks and re-runs.
 */
async function ensureDaysCached(lookbackDays: number): Promise<void> {
  const today = new Date();

  for (let offset = 0; offset < lookbackDays; offset++) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dateKey = toDateKey(date);

    const cached = await prisma.edinetDailyDocuments.findUnique({
      where: { date: new Date(dateKey) },
    });
    if (cached) {
      continue;
    }

    const documents = await fetchDocumentsForDate(dateKey);
    if (documents === null) {
      // No Subscription-Key configured, or the call failed — stop scanning
      // further (older) dates this run; already-cached dates remain usable.
      return;
    }

    await prisma.edinetDailyDocuments.create({
      data: { date: new Date(dateKey), documents: documents as unknown as Prisma.InputJsonValue },
    });
  }
}

/**
 * Returns the most recent disclosure documents for a stock's securities
 * code, drawn from the cached daily lists. Returns an empty array when no
 * Subscription-Key is configured or nothing matched — never throws.
 */
export async function findRecentDisclosures(code: string): Promise<DisclosureDocument[]> {
  const lookbackDays = Number(process.env.EDINET_LOOKBACK_DAYS) || DEFAULT_LOOKBACK_DAYS;

  await ensureDaysCached(lookbackDays);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - lookbackDays);

  const cachedDays = await prisma.edinetDailyDocuments.findMany({
    where: { date: { gte: cutoff } },
  });

  const matches: DisclosureDocument[] = [];
  for (const day of cachedDays) {
    const documents = (day.documents as unknown as RawEdinetDocument[]) ?? [];
    for (const doc of documents) {
      if (doc.secCode?.startsWith(code)) {
        matches.push({
          docId: doc.docID,
          filerName: doc.filerName,
          docDescription: doc.docDescription ?? "(タイトルなし)",
          docTypeCode: doc.docTypeCode ?? "",
          submittedAt: doc.submitDateTime,
        });
      }
    }
  }

  matches.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  return matches.slice(0, 10);
}
