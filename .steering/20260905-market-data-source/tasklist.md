# tasklist.md - 株価・財務データ取得方式の変更(タスク)

対象: `.steering/20260905-market-data-source/`

## タスク一覧

- [x] `docs/architecture.md` 更新(J-Quants/EDINET採用、技術的制約の追記)
- [x] `docs/functional-design.md` 更新(システム構成図・ER図・API設計)
- [x] `docs/glossary.md` 更新(PriceFinancialDataの定義更新)
- [x] Prismaスキーマ変更 + マイグレーション(price nullable化、disclosureDocuments追加、EdinetDailyDocuments新設)
- [x] `src/lib/market-data/jquants-client.ts` 実装
- [x] `src/lib/market-data/edinet-client.ts` 実装(日付キャッシュ含む)
- [x] `src/features/stock-detail/server/market-data-sync.ts` 実装
- [x] `POST /api/stocks/{stockId}/market-data` 実装
- [x] `StockDetailView` / `MarketDataSyncControl` のUI更新
- [x] `prisma/seed.ts` から架空の財務指標を削除
- [x] `.env.example` 更新
- [x] Lint/Typecheck/Test/Buildの実行と修正

## 完了条件

- 本ファイルの全タスクが完了していること
- `.steering/20260905-market-data-source/requirements.md` の受け入れ条件をすべて満たしていること
- `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build` が成功すること

## 実装メモ

- 認証情報(J-Quants/EDINETとも)未設定の状態で `POST /api/stocks/{stockId}/market-data` を実行し、エラーにならず `price: null` / `disclosureDocuments: null` として応答すること、画面上で「未取得」と表示されることを確認した。
- 既存の調査実行機能(Web/YouTube/SNSシグナル調査)には影響がないことを確認した。
- EDINET側は「決算短信」がTDnet(東証)提供でありEDINETの対象外である点に注意し、設計書の例示を有価証券報告書・四半期報告書・臨時報告書に修正した。
- 実際にVercelへデプロイし、ユーザーが取得した認証情報で動作確認したところ、以下の2件の実装ミスが見つかり修正した。
  - EDINETのアクセス先URLが誤っていた(`disclosure.edinet-fsa.go.jp` → 正しくは `api.edinet-fsa.go.jp`。旧v1 APIやブラウザ向け閲覧サイトとは別ドメイン)
  - J-QuantsはユーザーのAPI Keys発行状況を確認した結果、V2 APIに移行しておりメールアドレス+パスワードのトークン認証(V1)は使えず、マイページで発行する単一のAPIキーを`x-api-key`ヘッダーに付与する方式に変わっていた。エンドポイントも `/v1/prices/daily_quotes` から `/v2/equities/bars/daily` に変更されている。設計時点の情報が古かったため実装を修正した
  - 上記2点は本番デプロイ後の実機確認(Vercelのランタイムログでのエラー内容確認)で発覚した。ローカル開発環境では実際の外部APIキーを使った検証ができなかったため、設計時点では気づけなかった
