import type { SearchProvider, SearchResultItem } from "./types";
import { createMockProvider } from "./mock-search-provider";

const mockProvider = createMockProvider("web");

/**
 * Google Custom Search JSON API. Requires both an API key and a Search
 * Engine ID (cx). Falls back to the mock provider when either is missing,
 * or when the real call fails, so the investigation flow never breaks.
 */
export const webSearchProvider: SearchProvider = {
  sourceType: "web",
  async search(query, stockName): Promise<SearchResultItem[]> {
    const apiKey = process.env.WEB_SEARCH_API_KEY;
    const engineId = process.env.WEB_SEARCH_ENGINE_ID;

    if (!apiKey || !engineId) {
      return mockProvider.search(query, stockName);
    }

    try {
      const url = new URL("https://www.googleapis.com/customsearch/v1");
      url.searchParams.set("key", apiKey);
      url.searchParams.set("cx", engineId);
      url.searchParams.set("q", query);

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Web search API returned status ${response.status}`);
      }

      const data = (await response.json()) as {
        items?: { link: string; title: string; snippet: string }[];
      };

      return (data.items ?? []).map((item) => ({
        sourceType: "web" as const,
        url: item.link,
        title: item.title,
        snippet: item.snippet,
        publishedAt: null,
      }));
    } catch {
      return mockProvider.search(query, stockName);
    }
  },
};
