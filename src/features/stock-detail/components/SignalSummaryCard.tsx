const DIRECTION_LABEL: Record<string, string> = {
  up: "↑ 増加",
  down: "↓ 減少",
  unknown: "→ 不明",
};

const SIGNAL_TYPE_LABEL: Record<string, string> = {
  quantity: "数量",
  price: "単価",
};

interface Evidence {
  id: string;
  url: string;
  title: string;
  sourceType: string;
}

interface SignalSummaryCardProps {
  signalType: string;
  direction: string;
  summary: string;
  evidences: Evidence[];
}

export function SignalSummaryCard({ signalType, direction, summary, evidences }: SignalSummaryCardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium">{SIGNAL_TYPE_LABEL[signalType] ?? signalType}</span>
        <span
          className={
            direction === "up"
              ? "font-semibold text-emerald-600"
              : direction === "down"
                ? "font-semibold text-red-600"
                : "font-semibold text-zinc-400"
          }
        >
          {DIRECTION_LABEL[direction] ?? direction}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-600">{summary}</p>
      {evidences.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1">
          {evidences.map((evidence) => (
            <li key={evidence.id} className="text-sm">
              <a
                href={evidence.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                [{evidence.sourceType}] {evidence.title}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-400">根拠なし</p>
      )}
    </div>
  );
}
