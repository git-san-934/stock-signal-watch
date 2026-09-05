import { prisma } from "@/lib/db/prisma";
import { WatchlistView } from "@/features/watchlist/components/WatchlistView";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await prisma.watchlistItem.findMany({
    include: { stock: true },
    orderBy: { registeredAt: "asc" },
  });

  return <WatchlistView initialStocks={items.map((item) => item.stock)} />;
}
