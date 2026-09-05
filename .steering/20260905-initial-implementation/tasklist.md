# tasklist.md - 初回実装のタスクリスト

対象: `.steering/20260905-initial-implementation/`

## タスク一覧

- [ ] プロジェクト初期化(Next.js + TypeScript + Tailwind + ESLint/Prettier + Vitest)
- [ ] Prismaセットアップ(SQLite、`schema.prisma` 定義、初回マイグレーション)
- [ ] シードデータ作成(サンプル銘柄・株価財務データ)
- [ ] `src/lib/db/prisma.ts`(Prisma Clientシングルトン)
- [ ] `src/lib/search-providers`(`SearchProvider`インターフェース + モック実装)
- [ ] `src/lib/signal-extraction`(モック検索結果からのシグナル抽出ロジック + テスト)
- [ ] ウォッチリスト機能(API + UI)
- [ ] 銘柄詳細画面(シグナル要約 + 株価財務データ表示)
- [ ] 調査実行機能(調査API + オーケストレーション)
- [ ] 調査履歴一覧・詳細画面
- [ ] レスポンシブレイアウトの調整・確認
- [ ] Lint/Typecheck/Test/Buildの実行と修正

## 完了条件

- 本ファイルの全タスクが完了していること
- `.steering/20260905-initial-implementation/requirements.md` の受け入れ条件をすべて満たしていること
- `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build` が成功すること
