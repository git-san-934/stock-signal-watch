import type { SearchProvider } from "./types";
import { createMockProvider } from "./mock-search-provider";

/**
 * SNS APIs vary widely in access terms and cost, so the initial
 * implementation only defines the adapter shape (see docs/architecture.md,
 * "技術的制約と要件") and always uses the mock provider. A real
 * implementation can be added later behind this same interface.
 */
export const snsSearchProvider: SearchProvider = createMockProvider("sns");
