import { describe, expect, it } from "vitest";
import { extractSignals } from "./extract-signals";
import type { SearchResultItem } from "@/lib/search-providers/types";

function makeItem(overrides: Partial<SearchResultItem>): SearchResultItem {
  return {
    sourceType: "web",
    url: "https://example.com",
    title: "",
    snippet: "",
    publishedAt: null,
    ...overrides,
  };
}

describe("extractSignals", () => {
  it("judges direction as up when up-keywords outnumber down-keywords", () => {
    const items = [
      makeItem({ title: "好調な売れ行き", snippet: "品薄が続いている" }),
      makeItem({ title: "値上げの動き", snippet: "価格上昇が見られる" }),
    ];

    const [quantity, price] = extractSignals(items);

    expect(quantity.signalType).toBe("quantity");
    expect(quantity.direction).toBe("up");
    expect(quantity.evidences).toHaveLength(1);

    expect(price.signalType).toBe("price");
    expect(price.direction).toBe("up");
    expect(price.evidences).toHaveLength(1);
  });

  it("judges direction as down when down-keywords outnumber up-keywords", () => {
    const items = [makeItem({ title: "苦戦が続く", snippet: "在庫過剰で値下げセールも" })];

    const [quantity, price] = extractSignals(items);

    expect(quantity.direction).toBe("down");
    expect(price.direction).toBe("down");
  });

  it("returns unknown with no evidence when nothing matches", () => {
    const items = [makeItem({ title: "決算発表のお知らせ", snippet: "詳細は後日公開" })];

    const [quantity, price] = extractSignals(items);

    expect(quantity.direction).toBe("unknown");
    expect(quantity.evidences).toHaveLength(0);
    expect(price.direction).toBe("unknown");
    expect(price.evidences).toHaveLength(0);
  });

  it("returns unknown but keeps evidence when up and down counts tie", () => {
    const items = [
      makeItem({ title: "好調な売れ行き", snippet: "特に変化なし" }),
      makeItem({ title: "苦戦が続く", snippet: "特に変化なし" }),
    ];

    const [quantity] = extractSignals(items);

    expect(quantity.direction).toBe("unknown");
    expect(quantity.evidences).toHaveLength(2);
  });

  it("returns unknown with no evidence for an empty result set", () => {
    const [quantity, price] = extractSignals([]);

    expect(quantity.direction).toBe("unknown");
    expect(price.direction).toBe("unknown");
  });
});
