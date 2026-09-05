"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface InvestigationTriggerControlProps {
  stockId: string;
}

export function InvestigationTriggerControl({ stockId }: InvestigationTriggerControlProps) {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    setIsRunning(true);
    setError(null);
    try {
      const response = await fetch(`/api/stocks/${stockId}/investigations`, { method: "POST" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "調査の実行に失敗しました");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "調査の実行に失敗しました");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleRun}
        disabled={isRunning}
        className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {isRunning ? "調査を実行中..." : "調査を実行"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
