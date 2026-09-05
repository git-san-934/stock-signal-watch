import Link from "next/link";
import { SignalSummaryCard } from "@/features/stock-detail/components/SignalSummaryCard";

interface Evidence {
  id: string;
  url: string;
  title: string;
  sourceType: string;
}

interface Signal {
  id: string;
  signalType: string;
  direction: string;
  summary: string;
  evidences: Evidence[];
}

interface InvestigationDetailViewProps {
  stockId: string;
  stockName: string;
  investigation: {
    id: string;
    executedAt: Date;
    status: string;
    signals: Signal[];
  };
}

export function InvestigationDetailView({
  stockId,
  stockName,
  investigation,
}: InvestigationDetailViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <Link href={`/stocks/${stockId}/investigations`} className="text-sm text-zinc-500 hover:underline">
        ← 調査履歴に戻る
      </Link>

      <section>
        <h1 className="text-xl font-semibold">調査結果詳細</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {stockName} ・ {new Date(investigation.executedAt).toLocaleString("ja-JP")}
        </p>
      </section>

      <div className="flex flex-col gap-3">
        {investigation.signals.map((signal) => (
          <SignalSummaryCard
            key={signal.id}
            signalType={signal.signalType}
            direction={signal.direction}
            summary={signal.summary}
            evidences={signal.evidences}
          />
        ))}
      </div>
    </div>
  );
}
