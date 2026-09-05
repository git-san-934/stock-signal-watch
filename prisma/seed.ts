import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 実際の株価・開示書類はJ-Quants/EDINET(未設定時はアプリ上で「未取得」表示)から
// 取得するため、ここでは架空の数値は投入せず、銘柄マスタとウォッチリスト登録のみ行う。
const SAMPLE_STOCKS = [
  { code: "7203", name: "トヨタ自動車" },
  { code: "6758", name: "ソニーグループ" },
  { code: "9983", name: "ファーストリテイリング" },
];

async function main() {
  for (const sample of SAMPLE_STOCKS) {
    const stock = await prisma.stock.upsert({
      where: { code: sample.code },
      update: { name: sample.name },
      create: { code: sample.code, name: sample.name },
    });

    await prisma.watchlistItem.upsert({
      where: { stockId: stock.id },
      update: {},
      create: { stockId: stock.id },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
