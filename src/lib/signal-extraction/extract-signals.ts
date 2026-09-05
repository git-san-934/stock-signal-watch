import type { SearchResultItem } from "@/lib/search-providers/types";

export type SignalType = "quantity" | "price";
export type Direction = "up" | "down" | "unknown";

export interface ExtractedSignal {
  signalType: SignalType;
  direction: Direction;
  summary: string;
  evidences: SearchResultItem[];
}

const KEYWORDS: Record<SignalType, Record<"up" | "down", string[]>> = {
  quantity: {
    up: ["好調", "完売", "品薄", "需要増", "売れ行き好調", "増加"],
    down: ["伸び悩み", "苦戦", "在庫過剰", "売れ行き不振", "減少"],
  },
  price: {
    up: ["値上げ", "値上がり", "価格上昇"],
    down: ["値下げ", "値下がり", "価格下落", "セール", "割引"],
  },
};

function textOf(item: SearchResultItem): string {
  return `${item.title}\n${item.snippet}`;
}

function matchesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractOne(signalType: SignalType, items: SearchResultItem[]): ExtractedSignal {
  const upEvidences = items.filter((item) => matchesAny(textOf(item), KEYWORDS[signalType].up));
  const downEvidences = items.filter((item) => matchesAny(textOf(item), KEYWORDS[signalType].down));

  if (upEvidences.length > downEvidences.length) {
    return {
      signalType,
      direction: "up",
      summary: `${signalType === "quantity" ? "数量" : "単価"}の増加を示唆する言及が見つかりました。`,
      evidences: upEvidences,
    };
  }

  if (downEvidences.length > upEvidences.length) {
    return {
      signalType,
      direction: "down",
      summary: `${signalType === "quantity" ? "数量" : "単価"}の減少を示唆する言及が見つかりました。`,
      evidences: downEvidences,
    };
  }

  const label = signalType === "quantity" ? "数量" : "単価";
  const tiedEvidences = [...upEvidences, ...downEvidences];

  return {
    signalType,
    direction: "unknown",
    summary:
      tiedEvidences.length > 0
        ? `${label}については増加・減少それぞれを示唆する言及が見つかり、判断できませんでした。`
        : `${label}の増減を判断できる言及は見つかりませんでした。`,
    evidences: tiedEvidences,
  };
}

export function extractSignals(items: SearchResultItem[]): ExtractedSignal[] {
  return [extractOne("quantity", items), extractOne("price", items)];
}
