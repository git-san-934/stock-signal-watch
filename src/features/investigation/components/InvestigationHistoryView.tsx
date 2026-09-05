import Link from "next/link";

const DIRECTION_LABEL: Record<string, string> = {
  up: "↑",
  down: "↓",
  unknown: "→",
};

const SIGNAL_TYPE_LABEL: Record<string, string> = {
  quantity: "数量",
  price: "単価",
};

interface Signal {
  id: string;
  signalType: string;
  direction: string;
}

interface Investigation {
  id: string;
  executedAt: Date;
  status: string;
  signals: Signal[];
}

interface InvestigationHistoryViewProps {
  stockId: string;
  stockName: string;
  investigations: Investigation[];
}

export function InvestigationHistoryView({
  stockId,
  stockName,
  investigations,
}: InvestigationHistoryViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <Link href={`/stocks/${stockId}`} className="text-sm text-zinc-500 hover:underline">
        ← {stockName}の詳細に戻る
      </Link>

      <section>
        <h1 className="text-xl font-semibold">調査履歴</h1>
        <p className="mt-1 text-sm text-zinc-500">{stockName}</p>
      </section>

      <ul className="flex flex-col gap-2">
        {investigations.length === 0 && (
          <li className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            調査履歴がまだありません。
          </li>
        )}
        {investigations.map((investigation) => (
          <li key={investigation.id}>
            <Link
              href={`/stocks/${stockId}/investigations/${investigation.id}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400"
            >
              <span className="text-sm">
                {new Date(investigation.executedAt).toLocaleString("ja-JP")}
              </span>
              <span className="flex gap-3 text-sm">
                {investigation.signals.map((signal) => (
                  <span key={signal.id}>
                    {SIGNAL_TYPE_LABEL[signal.signalType] ?? signal.signalType}
                    {DIRECTION_LABEL[signal.direction] ?? signal.direction}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
