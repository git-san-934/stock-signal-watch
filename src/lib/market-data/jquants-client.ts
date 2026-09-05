const JQUANTS_BASE_URL = "https://api.jquants.com/v1";

export interface StockPrice {
  code: string;
  date: string;
  close: number;
}

async function fetchIdToken(): Promise<string | null> {
  const mailAddress = process.env.JQUANTS_MAIL_ADDRESS;
  const password = process.env.JQUANTS_PASSWORD;

  if (!mailAddress || !password) {
    return null;
  }

  const authResponse = await fetch(`${JQUANTS_BASE_URL}/token/auth_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mailaddress: mailAddress, password }),
  });
  if (!authResponse.ok) {
    throw new Error(`J-Quants auth_user returned status ${authResponse.status}`);
  }
  const { refreshToken } = (await authResponse.json()) as { refreshToken: string };

  const refreshResponse = await fetch(
    `${JQUANTS_BASE_URL}/token/auth_refresh?refreshtoken=${encodeURIComponent(refreshToken)}`,
    { method: "POST" },
  );
  if (!refreshResponse.ok) {
    throw new Error(`J-Quants auth_refresh returned status ${refreshResponse.status}`);
  }
  const { idToken } = (await refreshResponse.json()) as { idToken: string };

  return idToken;
}

/**
 * Fetches the most recent daily close price for a stock code from J-Quants.
 * Returns null when credentials are not configured, or when the call fails
 * for any reason — callers should treat this as "not yet available" rather
 * than a hard error (see docs/architecture.md, "技術的制約と要件").
 */
export async function fetchLatestStockPrice(code: string): Promise<StockPrice | null> {
  try {
    const idToken = await fetchIdToken();
    if (!idToken) {
      return null;
    }

    const url = new URL(`${JQUANTS_BASE_URL}/prices/daily_quotes`);
    url.searchParams.set("code", code);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (!response.ok) {
      throw new Error(`J-Quants daily_quotes returned status ${response.status}`);
    }

    const data = (await response.json()) as {
      daily_quotes?: { Code: string; Date: string; Close: number | null }[];
    };
    const quotes = data.daily_quotes ?? [];
    const latest = [...quotes].reverse().find((quote) => quote.Close !== null);

    if (!latest || latest.Close === null) {
      return null;
    }

    return { code: latest.Code, date: latest.Date, close: latest.Close };
  } catch (error) {
    console.error("J-Quants fetchLatestStockPrice failed", error);
    return null;
  }
}
