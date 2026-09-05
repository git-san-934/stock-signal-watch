# development-guidelines.md - 開発ガイドライン

本プロジェクトにおけるコーディング規約(命名規則、スタイリング規約、テスト規約、Git規約)を定義する。

## 1. 命名規則

- **ファイル名**
  - コンポーネント: `PascalCase.tsx`(例: `StockDetailView.tsx`)
  - それ以外のTypeScriptファイル: `kebab-case.ts`(例: `extract-signals.ts`)
  - テストファイル: 対象ファイル名 + `.test.ts`(例: `extract-signals.test.ts`)
- **変数・関数**: `camelCase`
- **型・インターフェース・コンポーネント**: `PascalCase`
- **定数**: `UPPER_SNAKE_CASE`(モジュールスコープの不変値のみ)
- **Prismaモデル名**: `PascalCase`(単数形。例: `Stock`, `Investigation`, `Signal`, `Evidence`)
- **DBカラム名**: Prismaの規約に従い `camelCase` で定義し、`@@map`/`@map` でDB側は `snake_case` に変換する
- **ドメイン用語の命名**: `docs/glossary.md` の英日対応表に従う(独自の類義語を作らない)

## 2. スタイリング規約

- Tailwind CSSのユーティリティクラスを基本とし、共通デザイントークン(色・余白)が必要な場合は `tailwind.config.ts` に定義する
- レスポンシブ対応は Tailwind のブレークポイント(`sm:`, `md:`, `lg:`)を用い、モバイルファースト(未指定クラス = スマホ幅)で記述する
- コンポーネント固有のスタイルが複雑になる場合のみ、同階層に `*.module.css` を追加してよい
- アイコン・カラーパレット等の一貫性のため、汎用UI部品は `src/components/` に集約し、featureごとに似たコンポーネントを重複実装しない

## 3. テスト規約

- ユニットテスト: Vitestを使用し、`src/lib/` と `src/features/*/server/` のロジック(シグナル抽出、検索プロバイダのアダプタ、サービス層)を優先的にカバーする
- E2Eテスト: Playwrightを使用し、主要ユースケース(銘柄登録 → 調査実行 → シグナル確認 → 履歴確認)を最小限のシナリオとして用意する
- 外部API(Web検索・YouTube・SNS・証券会社データ)に依存するテストは、モックプロバイダ/フィクスチャデータを用い、実APIへ通信しない
- 新規ロジック追加時は最低限の正常系テストを追加する。バグ修正時は再発防止のための回帰テストを追加する

## 4. Git規約

- **ブランチ命名**: `.steering/[YYYYMMDD]-[開発タイトル]` に対応させ、`feature/[開発タイトル]` または `fix/[開発タイトル]` とする
- **コミットメッセージ**: 命令形の要約行(例: `Add watchlist API`, `Fix signal direction judgement`)。日本語・英語どちらでも可だが、1つのコミットでは統一する
- **コミット粒度**: 意味のある単位(1機能・1修正)でコミットし、無関係な変更を混在させない
- **プルリクエスト**: `.steering/[YYYYMMDD]-[開発タイトル]/` のrequirements.md/design.mdへのリンクをPR説明に含め、レビュー時に背景を追いやすくする
- **mainブランチ**: 常に動作する状態を保つ。作業ブランチで完結させてからマージする

## 5. その他の実装規約

- 秘匿情報(APIキー等)はコードにハードコードせず、環境変数(`.env.local`、本番はシークレットマネージャ)経由で読み込む。`.env.example` にはキー名のみを記載する
- 外部検索プロバイダはすべて `src/lib/search-providers/types.ts` の `SearchProvider` インターフェースを実装し、呼び出し側は具体的なプロバイダ実装に依存しない
- 型は可能な限りPrismaが生成する型を再利用し、DTOやビューモデルが必要な場合のみ独自型を定義する
- Lint(ESLint)・Format(Prettier)のエラーはコミット前に解消する
