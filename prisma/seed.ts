import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SAMPLE_STOCKS = [
  {
    code: "7203",
    name: "トヨタ自動車",
    price: 2980,
    financialMetrics: { per: 10.2, pbr: 1.1, dividendYield: 3.1 },
  },
  {
    code: "6758",
    name: "ソニーグループ",
    price: 3520,
    financialMetrics: { per: 18.4, pbr: 2.3, dividendYield: 0.7 },
  },
  {
    code: "9983",
    name: "ファーストリテイリング",
    price: 45230,
    financialMetrics: { per: 34.1, pbr: 8.9, dividendYield: 0.9 },
  },
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

    await prisma.priceFinancialData.upsert({
      where: { stockId_dataDate: { stockId: stock.id, dataDate: new Date("2026-09-01") } },
      update: {
        price: sample.price,
        financialMetrics: sample.financialMetrics,
      },
      create: {
        stockId: stock.id,
        dataDate: new Date("2026-09-01"),
        price: sample.price,
        financialMetrics: sample.financialMetrics,
      },
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
