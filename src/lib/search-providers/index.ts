import type { SearchProvider } from "./types";
import { webSearchProvider } from "./web-search-provider";
import { youtubeSearchProvider } from "./youtube-search-provider";
import { snsSearchProvider } from "./sns-search-provider";

export * from "./types";

export function getSearchProviders(): SearchProvider[] {
  return [webSearchProvider, youtubeSearchProvider, snsSearchProvider];
}
