# tasklist.md - 初回実装のタスクリスト

対象: `.steering/20260905-initial-implementation/`

## タスク一覧

- [x] プロジェクト初期化(Next.js + TypeScript + Tailwind + ESLint/Prettier + Vitest)
- [x] Prismaセットアップ(SQLite、`schema.prisma` 定義、初回マイグレーション)
- [x] シードデータ作成(サンプル銘柄・株価財務データ)
- [x] `src/lib/db/prisma.ts`(Prisma Clientシングルトン)
- [x] `src/lib/search-providers`(`SearchProvider`インターフェース + モック実装、Web/YouTubeは実APIキー設定時のフォールバック付き)
- [x] `src/lib/signal-extraction`(モック検索結果からのシグナル抽出ロジック + テスト)
- [x] ウォッチリスト機能(API + UI)
- [x] 銘柄詳細画面(シグナル要約 + 株価財務データ表示)
- [x] 調査実行機能(調査API + オーケストレーション)
- [x] 調査履歴一覧・詳細画面
- [x] レスポンシブレイアウトの調整・確認(モバイルファーストのTailwindクラスで実装)
- [x] Lint/Typecheck/Test/Buildの実行と修正

## 完了条件

- 本ファイルの全タスクが完了していること
- `.steering/20260905-initial-implementation/requirements.md` の受け入れ条件をすべて満たしていること
- `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build` が成功すること

## 実装メモ

- 初回実装時、モック検索プロバイダのスニペットに検索クエリ文字列(「値上げ」「値下げ」等を含む)をそのまま埋め込んでいたため、単価シグナルの判定が常に増減同数(引き分け)になるバグを開発中に発見し修正した。あわせて、シグナル抽出ロジックが「引き分け」時に根拠情報を破棄していた点も修正し、`direction: "unknown"` でも根拠(相反する言及)を確認できるようにした。
- 実行確認: `npm run build` 後 `next start` でローカル起動し、ウォッチリスト表示・銘柄追加/削除・調査実行・シグナル表示・調査履歴一覧/詳細の一連の画面遷移をAPI経由で動作確認済み。
