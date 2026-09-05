"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface WatchlistStock {
  id: string;
  code: string;
  name: string;
}

interface WatchlistViewProps {
  initialStocks: WatchlistStock[];
}

export function WatchlistView({ initialStocks }: WatchlistViewProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "登録に失敗しました");
      }
      setCode("");
      setName("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(stockId: string) {
    await fetch(`/api/watchlist/${stockId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
      <section>
        <h1 className="text-xl font-semibold">ウォッチリスト</h1>
        <p className="mt-1 text-sm text-zinc-500">
          重点監視する銘柄を登録し、数量・単価シグナルの調査を行います。
        </p>
      </section>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          証券コード
          <input
            className="rounded border border-zinc-300 px-3 py-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="7203"
            required
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          銘柄名
          <input
            className="rounded border border-zinc-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="トヨタ自動車"
            required
          />
        </label>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          追加
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2">
        {initialStocks.length === 0 && (
          <li className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            監視銘柄がまだ登録されていません。
          </li>
        )}
        {initialStocks.map((stock) => (
          <li
            key={stock.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4"
          >
            <Link href={`/stocks/${stock.id}`} className="flex flex-col">
              <span className="font-medium">{stock.name}</span>
              <span className="text-sm text-zinc-500">{stock.code}</span>
            </Link>
            <button
              onClick={() => handleRemove(stock.id)}
              className="text-sm text-red-600 hover:underline"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
