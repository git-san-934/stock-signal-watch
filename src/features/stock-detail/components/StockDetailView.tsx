import Link from "next/link";
import { SignalSummaryCard } from "./SignalSummaryCard";
import { InvestigationTriggerControl } from "@/features/investigation/components/InvestigationTriggerControl";

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

interface Investigation {
  id: string;
  executedAt: Date;
  status: string;
  signals: Signal[];
}

interface PriceFinancialData {
  id: string;
  dataDate: Date;
  price: number;
  financialMetrics: unknown;
}

interface StockDetailViewProps {
  stock: {
    id: string;
    code: string;
    name: string;
    investigations: Investigation[];
    priceFinancialData: PriceFinancialData[];
  };
}

export function StockDetailView({ stock }: StockDetailViewProps) {
  const latestInvestigation = stock.investigations[0];
  const latestPriceData = stock.priceFinancialData[0];
  const financialMetrics =
    latestPriceData && typeof latestPriceData.financialMetrics === "object"
      ? (latestPriceData.financialMetrics as Record<string, number>)
      : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">
          ← 戻る
        </Link>
      </div>

      <section>
        <h1 className="text-xl font-semibold">{stock.name}</h1>
        <p className="text-sm text-zinc-500">{stock.code}</p>
      </section>

      <InvestigationTriggerControl stockId={stock.id} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-zinc-500">シグナル要約</h2>
        {latestInvestigation ? (
          <div className="flex flex-col gap-3">
            {latestInvestigation.signals.map((signal) => (
              <SignalSummaryCard
                key={signal.id}
                signalType={signal.signalType}
                direction={signal.direction}
                summary={signal.summary}
                evidences={signal.evidences}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
            まだ調査が実行されていません。「調査を実行」から開始してください。
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-500">株価・財務データ</h2>
        {latestPriceData ? (
          <div className="flex flex-col gap-1 text-sm">
            <p>
              株価: <span className="font-medium">{latestPriceData.price.toLocaleString()}円</span>{" "}
              <span className="text-zinc-400">
                ({new Date(latestPriceData.dataDate).toLocaleDateString("ja-JP")}時点)
              </span>
            </p>
            {financialMetrics && (
              <ul className="mt-1 flex flex-col gap-0.5 text-zinc-600">
                {Object.entries(financialMetrics).map(([key, value]) => (
                  <li key={key}>
                    {key}: {value}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">データがありません</p>
        )}
      </section>

      <Link
        href={`/stocks/${stock.id}/investigations`}
        className="text-sm text-blue-600 hover:underline"
      >
        調査履歴を見る →
      </Link>
    </div>
  );
}
