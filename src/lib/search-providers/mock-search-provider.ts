import type { SearchProvider, SearchResultItem, SourceType } from "./types";

/**
 * Deterministic (not random) dummy data generator so the same stock always
 * yields the same mock signal — useful for demoing the investigation flow
 * and for tests, without depending on real, TOS-restricted external APIs.
 */
function hashToUnit(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 100) / 100;
}

const MOCK_SOURCE_LABEL: Record<SourceType, string> = {
  web: "Web記事",
  youtube: "YouTube動画",
  sns: "SNS投稿",
};

export function createMockProvider(sourceType: SourceType): SearchProvider {
  return {
    sourceType,
    async search(query: string, stockName: string): Promise<SearchResultItem[]> {
      const seed = hashToUnit(`${sourceType}:${stockName}:${query}`);
      const isUp = seed >= 0.5;
      const label = MOCK_SOURCE_LABEL[sourceType];
      const trendWord = isUp ? "値上げ・好調" : "値下げ・伸び悩み";

      return [
        {
          sourceType,
          url: `https://example.com/${sourceType}/${encodeURIComponent(stockName)}/1`,
          title: `${stockName}に関する${label}: ${trendWord}の兆候`,
          snippet: `${stockName}に関する${label}を調査した結果、「${trendWord}」を示唆する内容が見つかりました(モックデータ、クエリ: ${query.length}文字)。`,
          publishedAt: new Date(),
        },
      ];
    },
  };
}
