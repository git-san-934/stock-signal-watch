/*
  Warnings:

  - You are about to drop the column `financialMetrics` on the `price_financial_data` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "edinet_daily_documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "documents" JSONB NOT NULL,
    "fetchedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_price_financial_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stockId" TEXT NOT NULL,
    "dataDate" DATETIME NOT NULL,
    "price" REAL,
    "priceSource" TEXT,
    "disclosureDocuments" JSONB,
    "disclosureSource" TEXT,
    CONSTRAINT "price_financial_data_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "stocks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_price_financial_data" ("dataDate", "id", "price", "stockId") SELECT "dataDate", "id", "price", "stockId" FROM "price_financial_data";
DROP TABLE "price_financial_data";
ALTER TABLE "new_price_financial_data" RENAME TO "price_financial_data";
CREATE UNIQUE INDEX "price_financial_data_stockId_dataDate_key" ON "price_financial_data"("stockId", "dataDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "edinet_daily_documents_date_key" ON "edinet_daily_documents"("date");
