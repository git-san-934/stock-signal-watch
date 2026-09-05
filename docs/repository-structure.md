# repository-structure.md - リポジトリ構造定義書

`docs/architecture.md` で定めた技術スタック(Next.js App Router + TypeScript + Prisma)を前提としたフォルダ・ファイル構成を定義する。

## 1. トップレベル構成

```
stock-signal-watch/
├── CLAUDE.md                  # プロジェクトメモリ(開発プロセス定義)
├── README.md
├── docs/                      # 永続的ドキュメント
│   ├── product-requirements.md
│   ├── functional-design.md
│   ├── architecture.md
│   ├── repository-structure.md
│   ├── development-guidelines.md
│   └── glossary.md
├── .steering/                 # 作業単位ドキュメント
│   └── [YYYYMMDD]-[開発タイトル]/
│       ├── requirements.md
│       ├── design.md
│       └── tasklist.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── src/
│   ├── app/                   # Next.js App Router (ページ・レイアウト・APIルート)
│   ├── features/              # 機能単位のUI・サーバー処理
│   ├── lib/                   # 横断的な共通ロジック
│   └── components/            # 汎用UIコンポーネント
├── .env.example
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

## 2. `src/app/` の構成

Next.js App Routerの規約に従い、画面遷移図(`functional-design.md` 6章)に対応させる。

```
src/app/
├── layout.tsx
├── page.tsx                          # ウォッチリスト一覧(トップ画面)
├── stocks/
│   └── [stockId]/
│       ├── page.tsx                  # 銘柄詳細画面
│       └── investigations/
│           ├── page.tsx              # 調査履歴一覧画面
│           └── [investigationId]/
│               └── page.tsx          # 調査結果詳細
└── api/
    ├── watchlist/
    │   ├── route.ts                  # GET(一覧) / POST(追加)
    │   └── [stockId]/route.ts        # DELETE(削除)
    └── stocks/
        └── [stockId]/
            ├── route.ts               # GET(銘柄詳細)
            └── investigations/
                ├── route.ts           # GET(履歴一覧) / POST(調査実行)
                └── [investigationId]/route.ts  # GET(調査結果詳細)
```

## 3. `src/features/` の構成

機能設計書の「コンポーネント設計」に対応する機能単位ディレクトリ。UIコンポーネントとサーバー側処理(サービス層)を同じ機能フォルダにまとめ、関連コードを探しやすくする。

```
src/features/
├── watchlist/
│   ├── components/           # WatchlistView 等
│   └── server/                # WatchlistService
├── stock-detail/
│   ├── components/           # StockDetailView, SignalSummaryCard 等
│   └── server/                # MarketDataReader
└── investigation/
    ├── components/            # InvestigationHistoryView, InvestigationTriggerControl 等
    └── server/                 # InvestigationOrchestrator, SignalExtractionService
```

## 4. `src/lib/` の構成

複数機能から参照される横断的ロジック。

```
src/lib/
├── db/
│   └── prisma.ts               # Prisma Clientのシングルトン
├── search-providers/
│   ├── types.ts                 # SearchProviderインターフェース定義
│   ├── web-search-provider.ts
│   ├── youtube-search-provider.ts
│   ├── sns-search-provider.ts
│   └── mock-search-provider.ts  # APIキー未設定時のフォールバック
└── signal-extraction/
    └── extract-signals.ts       # 検索結果 → シグナル判定ロジック
```

## 5. ディレクトリの役割

| ディレクトリ | 役割 |
| --- | --- |
| `docs/` | アプリ全体の恒久的な設計ドキュメント。基本設計変更時のみ更新 |
| `.steering/` | 個々の開発作業の要求・設計・タスクを記録する一時的ドキュメント |
| `prisma/` | データベーススキーマとマイグレーション履歴 |
| `src/app/` | 画面・APIルートのエントリポイント(Next.js規約) |
| `src/features/` | 機能ごとのUI・サーバーロジックのまとまり |
| `src/lib/` | 機能をまたいで使う共通処理(DB接続、外部API連携、シグナル抽出) |
| `src/components/` | 特定機能に依存しない汎用UI部品(ボタン、カード等) |

## 6. ファイル配置ルール

- 新しい画面を追加する場合は `src/app/` 配下にNext.js規約に沿ってルーティングファイルを追加する
- 画面固有のロジック・コンポーネントは対応する `src/features/<feature>/` 配下に置き、`src/app/` 側は薄く保つ(ページはfeatureのコンポーネントを呼び出すだけにする)
- 複数featureで共有するロジックのみ `src/lib/` に置く。特定featureにしか使われないコードをむやみに`src/lib/`へ置かない
- 外部検索プロバイダを追加する場合は `src/lib/search-providers/` に `SearchProvider` インターフェースを実装したファイルを追加する
- テストファイルは対象コードと同階層に `*.test.ts` として配置する
- 作業単位ドキュメントは必ず `.steering/[YYYYMMDD]-[開発タイトル]/` 配下に作成し、既存の作業ディレクトリを上書きしない
