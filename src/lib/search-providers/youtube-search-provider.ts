import type { SearchProvider, SearchResultItem } from "./types";
import { createMockProvider } from "./mock-search-provider";

const mockProvider = createMockProvider("youtube");

/**
 * YouTube Data API v3 (search.list). Falls back to the mock provider when
 * no API key is configured, or when the real call fails.
 */
export const youtubeSearchProvider: SearchProvider = {
  sourceType: "youtube",
  async search(query, stockName): Promise<SearchResultItem[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return mockProvider.search(query, stockName);
    }

    try {
      const url = new URL("https://www.googleapis.com/youtube/v3/search");
      url.searchParams.set("key", apiKey);
      url.searchParams.set("q", query);
      url.searchParams.set("part", "snippet");
      url.searchParams.set("type", "video");
      url.searchParams.set("maxResults", "5");

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`YouTube API returned status ${response.status}`);
      }

      const data = (await response.json()) as {
        items?: {
          id: { videoId: string };
          snippet: { title: string; description: string; publishedAt: string };
        }[];
      };

      return (data.items ?? []).map((item) => ({
        sourceType: "youtube" as const,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        title: item.snippet.title,
        snippet: item.snippet.description,
        publishedAt: new Date(item.snippet.publishedAt),
      }));
    } catch {
      return mockProvider.search(query, stockName);
    }
  },
};
