"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface MarketDataSyncControlProps {
  stockId: string;
}

export function MarketDataSyncControl({ stockId }: MarketDataSyncControlProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setError(null);
    try {
      const response = await fetch(`/api/stocks/${stockId}/market-data`, { method: "POST" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "データの更新に失敗しました");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "データの更新に失敗しました");
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
      >
        {isSyncing ? "データを更新中..." : "株価・開示書類データを更新"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
