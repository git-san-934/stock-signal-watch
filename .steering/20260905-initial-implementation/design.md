# design.md - 初回実装の設計

対象: `.steering/20260905-initial-implementation/`

## 実装アプローチ

`docs/architecture.md` / `docs/repository-structure.md` に定義した構成に沿って、Next.js(App Router) + TypeScript + Prisma(SQLite)のフルスタックアプリとして実装する。外部検索API・証券会社APIとの実連携は行わず、以下の方針でモック化する。

- `src/lib/search-providers/mock-search-provider.ts` が固定のダミー検索結果を返す
- `src/lib/signal-extraction/extract-signals.ts` がダミー検索結果からキーワードベースでシグナル(増/減/不明)を判定する簡易ロジックを実装する(将来、実データ・より高度な判定ロジックに差し替え可能なようインターフェースを分離)
- 株価・財務データは、Prismaのシードデータ(`prisma/seed.ts`)としてサンプルを投入する

## 変更するコンポーネント

- `prisma/schema.prisma` … 新規作成(データモデル定義)
- `src/app/page.tsx` … ウォッチリスト一覧画面
- `src/app/stocks/[stockId]/page.tsx` … 銘柄詳細画面
- `src/app/stocks/[stockId]/investigations/page.tsx` … 調査履歴一覧画面
- `src/app/stocks/[stockId]/investigations/[investigationId]/page.tsx` … 調査結果詳細画面
- `src/app/api/watchlist/route.ts`, `src/app/api/watchlist/[stockId]/route.ts`
- `src/app/api/stocks/[stockId]/route.ts`
- `src/app/api/stocks/[stockId]/investigations/route.ts`, `.../[investigationId]/route.ts`
- `src/features/watchlist/**`
- `src/features/stock-detail/**`
- `src/features/investigation/**`
- `src/lib/db/prisma.ts`
- `src/lib/search-providers/**`
- `src/lib/signal-extraction/**`

## データ構造の変更

`docs/functional-design.md` 3章のER図をPrismaスキーマとして実装する。

```prisma
model Stock {
  id                String                @id @default(cuid())
  code              String                @unique
  name              String
  createdAt         DateTime              @default(now())
  watchlistItem     WatchlistItem?
  investigations    Investigation[]
  priceFinancialData PriceFinancialData[]
}

model WatchlistItem {
  id           String   @id @default(cuid())
  stockId      String   @unique
  stock        Stock    @relation(fields: [stockId], references: [id])
  registeredAt DateTime @default(now())
}

model Investigation {
  id          String   @id @default(cuid())
  stockId     String
  stock       Stock    @relation(fields: [stockId], references: [id])
  executedAt  DateTime @default(now())
  status      String   // "running" | "completed" | "failed"
  signals     Signal[]
}

model Signal {
  id              String   @id @default(cuid())
  investigationId String
  investigation   Investigation @relation(fields: [investigationId], references: [id])
  signalType      String   // "quantity" | "price"
  direction       String   // "up" | "down" | "unknown"
  summary         String
  evidences       Evidence[]
}

model Evidence {
  id          String   @id @default(cuid())
  signalId    String
  signal      Signal   @relation(fields: [signalId], references: [id])
  sourceType  String   // "web" | "youtube" | "sns"
  url         String
  title       String
  snippet     String
  publishedAt DateTime?
}

model PriceFinancialData {
  id                String   @id @default(cuid())
  stockId           String
  stock             Stock    @relation(fields: [stockId], references: [id])
  dataDate          DateTime
  price             Decimal
  financialMetrics  Json
}
```

## 影響範囲の分析

- 新規プロジェクトのため既存機能への影響はない
- `docs/functional-design.md` のAPI設計(8章)に準拠したAPIルートを実装する
- モック検索プロバイダ・簡易シグナル抽出ロジックは初回実装のみのものであり、後続作業単位で実API連携に差し替える前提(`SearchProvider`インターフェースを介するため既存コードへの影響は限定的)
