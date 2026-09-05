import Link from "next/link";
import { SignalSummaryCard } from "./SignalSummaryCard";
import { MarketDataSyncControl } from "./MarketDataSyncControl";
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

interface DisclosureDocument {
  docId: string;
  filerName: string;
  docDescription: string;
  docTypeCode: string;
  submittedAt: string;
}

interface PriceFinancialData {
  id: string;
  dataDate: Date;
  price: number | null;
  priceSource: string | null;
  disclosureDocuments: unknown;
  disclosureSource: string | null;
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
  const disclosureDocuments = Array.isArray(latestPriceData?.disclosureDocuments)
    ? (latestPriceData.disclosureDocuments as DisclosureDocument[])
    : [];

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

      <section className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-500">株価・財務データ</h2>
        </div>
        <MarketDataSyncControl stockId={stock.id} />

        <div className="text-sm">
          <span className="text-zinc-500">株価(J-Quants): </span>
          {latestPriceData?.price != null ? (
            <>
              <span className="font-medium">{latestPriceData.price.toLocaleString()}円</span>{" "}
              <span className="text-zinc-400">
                ({new Date(latestPriceData.dataDate).toLocaleDateString("ja-JP")}時点)
              </span>
            </>
          ) : (
            <span className="text-zinc-400">未取得</span>
          )}
        </div>

        <div className="text-sm">
          <p className="text-zinc-500">開示書類(EDINET):</p>
          {disclosureDocuments.length > 0 ? (
            <ul className="mt-1 flex flex-col gap-1">
              {disclosureDocuments.map((doc) => (
                <li key={doc.docId} className="text-zinc-700">
                  {doc.docDescription}
                  <span className="text-zinc-400">
                    {" "}
                    ({new Date(doc.submittedAt).toLocaleDateString("ja-JP")})
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-zinc-400">未取得</p>
          )}
        </div>
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
