# tasklist.md - 株価・財務データ取得方式の変更(タスク)

対象: `.steering/20260905-market-data-source/`

## タスク一覧

- [ ] `docs/architecture.md` 更新(J-Quants/EDINET採用、技術的制約の追記)
- [ ] `docs/functional-design.md` 更新(システム構成図・ER図・API設計)
- [ ] `docs/glossary.md` 更新(PriceFinancialDataの定義更新)
- [ ] Prismaスキーマ変更 + マイグレーション(price nullable化、disclosureDocuments追加、EdinetDailyDocuments新設)
- [ ] `src/lib/market-data/jquants-client.ts` 実装
- [ ] `src/lib/market-data/edinet-client.ts` 実装(日付キャッシュ含む)
- [ ] `src/features/stock-detail/server/market-data-sync.ts` 実装
- [ ] `POST /api/stocks/{stockId}/market-data` 実装
- [ ] `StockDetailView` / `MarketDataSyncControl` のUI更新
- [ ] `prisma/seed.ts` から架空の財務指標を削除
- [ ] `.env.example` 更新
- [ ] Lint/Typecheck/Test/Buildの実行と修正

## 完了条件

- 本ファイルの全タスクが完了していること
- `.steering/20260905-market-data-source/requirements.md` の受け入れ条件をすべて満たしていること
- `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build` が成功すること
