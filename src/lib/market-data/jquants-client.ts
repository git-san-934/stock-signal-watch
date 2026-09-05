const JQUANTS_BASE_URL = "https://api.jquants.com/v2";

export interface StockPrice {
  code: string;
  date: string;
  close: number;
}

type RawBar = Record<string, unknown>;

// The exact casing of these fields isn't pinned down in the public docs we
// could reach, so try a few plausible candidates rather than hard-failing
// on the first mismatch (see docs/architecture.md, "技術的制約と要件").
const DATE_FIELD_CANDIDATES = ["Date", "date", "TradingDate"];
const CLOSE_FIELD_CANDIDATES = ["Close", "close", "AdjustmentClose", "AdjClose", "AdjC"];
const CODE_FIELD_CANDIDATES = ["Code", "code"];

function pickField(bar: RawBar, candidates: string[]): unknown {
  for (const key of candidates) {
    if (bar[key] !== undefined && bar[key] !== null) {
      return bar[key];
    }
  }
  return undefined;
}

/**
 * Fetches the most recent daily close price for a stock code from J-Quants
 * API v2 (https://api.jquants.com/v2), which authenticates with a single
 * API key rather than the older mailaddress/password token flow. Returns
 * null when the key is not configured, or when the call fails for any
 * reason — callers should treat this as "not yet available" rather than a
 * hard error (see docs/architecture.md, "技術的制約と要件").
 */
export async function fetchLatestStockPrice(code: string): Promise<StockPrice | null> {
  const apiKey = process.env.JQUANTS_API_KEY;
  if (!apiKey) {
    return null;
  }

  try {
    const url = new URL(`${JQUANTS_BASE_URL}/equities/bars/daily`);
    url.searchParams.set("code", code);

    const response = await fetch(url.toString(), {
      headers: { "x-api-key": apiKey },
    });
    if (!response.ok) {
      throw new Error(`J-Quants equities/bars/daily returned status ${response.status}`);
    }

    const data = (await response.json()) as { data?: RawBar[] };
    const bars = data.data ?? [];
    if (bars.length === 0) {
      return null;
    }

    const sorted = [...bars].sort((a, b) => {
      const dateA = String(pickField(a, DATE_FIELD_CANDIDATES) ?? "");
      const dateB = String(pickField(b, DATE_FIELD_CANDIDATES) ?? "");
      return dateA < dateB ? 1 : -1;
    });

    for (const bar of sorted) {
      const close = pickField(bar, CLOSE_FIELD_CANDIDATES);
      const date = pickField(bar, DATE_FIELD_CANDIDATES);
      if (typeof close === "number" && typeof date === "string") {
        const resolvedCode = String(pickField(bar, CODE_FIELD_CANDIDATES) ?? code);
        return { code: resolvedCode, date, close };
      }
    }

    console.error("J-Quants equities/bars/daily returned bars with no recognizable close/date field", bars[0]);
    return null;
  } catch (error) {
    console.error("J-Quants fetchLatestStockPrice failed", error);
    return null;
  }
}
