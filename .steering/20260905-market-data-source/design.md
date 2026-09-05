# design.md - 株価・財務データ取得方式の変更(設計)

対象: `.steering/20260905-market-data-source/`

## 実装アプローチ

`MarketDataReader`(証券会社API読み込み想定だった箇所)を、J-QuantsクライアントとEDINETクライアントの2アダプタに分割する。両クライアントとも認証情報未設定時は`null`を返し、呼び出し側(同期処理)がそれを許容する。

### J-Quantsクライアント (`src/lib/market-data/jquants-client.ts`)

1. `POST /v1/token/auth_user` に `{mailaddress, password}`(環境変数 `JQUANTS_MAIL_ADDRESS` / `JQUANTS_PASSWORD`)を送り `refreshToken` を取得
2. `POST /v1/token/auth_refresh?refreshtoken=...` で `idToken` を取得
3. `GET /v1/prices/daily_quotes?code={code}` (Authorization: Bearer idToken) で当該銘柄の直近日次株価を取得し、最新日の終値(`Close`)を採用する
4. 認証情報未設定、またAPI呼び出し失敗時は `null` を返し、呼び出し側で「未取得」表示にフォールバックする

### EDINETクライアント (`src/lib/market-data/edinet-client.ts`)

1. `GET /api/v2/documents.json?date={date}&type=2&Subscription-Key={key}` で指定日の書類一覧を取得する(`EDINET_SUBSCRIPTION_KEY` 環境変数)
2. 直近 `EDINET_LOOKBACK_DAYS`(既定30、環境変数で上書き可)日分について、DBにキャッシュ済みでない日付のみAPIを呼び出し、`EdinetDailyDocuments`テーブルに日付単位でキャッシュする(全銘柄で共有するキャッシュのため、呼び出し回数を抑制できる)
3. キャッシュ済みの全日付分の書類から、`secCode`の先頭4桁が銘柄の証券コードと一致するものを抽出し、直近提出分を「開示書類一覧」として返す
4. Subscription-Key未設定、またはAPI呼び出し失敗時は既存キャッシュのみで応答するか、キャッシュも無ければ空配列を返す(エラーにしない)

### 同期オーケストレーション (`src/features/stock-detail/server/market-data-sync.ts`)

`runMarketDataSync(stockId)`:
1. 銘柄を取得
2. J-Quantsクライアントで株価取得を試行
3. EDINETクライアントで開示書類一覧取得を試行
4. 結果を`PriceFinancialData`(当日分、`dataDate`は実行日)に upsert する。両方とも未取得の場合でもレコード自体は作成し、「取得を試みたが未設定/失敗」を明示できるようにする

## 変更するコンポーネント

- `prisma/schema.prisma`
  - `PriceFinancialData.price` を `Float?` に変更(未取得を許容)
  - `PriceFinancialData.financialMetrics(Json)` を `disclosureDocuments(Json?)` に置き換え、開示書類一覧を保持する
  - `priceSource` / `disclosureSource` (String?) を追加し、データの出所(`jquants` / `edinet` / null)を保持する
  - `EdinetDailyDocuments` モデルを新規追加(日付単位のキャッシュ)
- `src/lib/market-data/jquants-client.ts`(新規)
- `src/lib/market-data/edinet-client.ts`(新規)
- `src/features/stock-detail/server/market-data-sync.ts`(新規)
- `src/app/api/stocks/[stockId]/market-data/route.ts`(新規、POSTで同期実行)
- `src/features/stock-detail/components/StockDetailView.tsx`(表示をEDINET開示書類一覧・J-Quants株価に対応させる)
- `src/features/stock-detail/components/MarketDataSyncControl.tsx`(新規、更新ボタン)
- `prisma/seed.ts`(架空の財務指標(PER/PBR等)を投入するのをやめ、銘柄マスタのみ投入する)
- `docs/architecture.md` / `docs/functional-design.md` / `docs/glossary.md` の該当箇所更新

## データ構造の変更

```prisma
model PriceFinancialData {
  id                  String   @id @default(cuid())
  stockId             String
  stock               Stock    @relation(fields: [stockId], references: [id], onDelete: Cascade)
  dataDate            DateTime
  price               Float?
  priceSource         String?
  disclosureDocuments Json?
  disclosureSource    String?

  @@unique([stockId, dataDate])
  @@map("price_financial_data")
}

model EdinetDailyDocuments {
  id        String   @id @default(cuid())
  date      DateTime @unique
  documents Json
  fetchedAt DateTime @default(now())

  @@map("edinet_daily_documents")
}
```

## 影響範囲の分析

- `docs/functional-design.md` のシステム構成図・API設計・ER図を更新する必要がある(証券会社API→J-Quants/EDINET)
- `docs/architecture.md` の技術的制約・非機能要件に、EDINETの検索制約(日付走査方式)とJ-Quantsの無料プランの制約を明記する
- `docs/glossary.md` の `PriceFinancialData` の用語定義を更新する
- 既存のシグナル調査機能(Web/YouTube/SNS検索)には影響しない(独立した機能)
- 既存のウォッチリスト・調査履歴機能には影響しない
