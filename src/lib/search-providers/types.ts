export type SourceType = "web" | "youtube" | "sns";

export interface SearchResultItem {
  sourceType: SourceType;
  url: string;
  title: string;
  snippet: string;
  publishedAt: Date | null;
}

export interface SearchProvider {
  sourceType: SourceType;
  search(query: string, stockName: string): Promise<SearchResultItem[]>;
}
