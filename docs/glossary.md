# glossary.md - ユビキタス言語定義

本プロジェクトで使用するドメイン用語・ビジネス用語・UI/UX用語を定義し、ドキュメント間・コード間での表記ゆれを防ぐ。

## 1. ドメイン用語 / ビジネス用語

| 日本語 | 英語(コード上の命名) | 定義 |
| --- | --- | --- |
| 銘柄 | Stock | 監視・調査の対象となる個別の上場企業(証券コードで識別) |
| 証券コード | Code | 銘柄を一意に識別する証券取引所発行のコード |
| ウォッチリスト / 監視銘柄 | Watchlist / WatchlistItem | ユーザーが継続的に監視対象として登録した銘柄の集合 |
| 調査 | Investigation | ある銘柄に対して、Web/YouTube/SNS検索を実行し、シグナルを判定する一連の処理(1回分の実行単位) |
| シグナル | Signal | 調査の結果として得られる「数量」または「単価」の増減判定 |
| シグナル種別 | SignalType | シグナルの対象区分。「数量(Quantity)」「単価(Price)」の2種類 |
| 判定方向 | Direction | シグナルの増減方向。「増(Up)」「減(Down)」「不明(Unknown)」の3値 |
| 根拠情報 | Evidence | シグナル判定の裏付けとなる個別の情報源(検索結果1件分) |
| 情報源種別 | SourceType | 根拠情報の取得元区分。「Web」「YouTube」「SNS」 |
| 株価・財務データ | PriceFinancialData | J-Quants API(株価)・EDINET API(開示書類一覧)から取得したデータ。いずれも証券会社口座は不要 |
| 開示書類 | DisclosureDocument | EDINETで取得できる有価証券報告書・決算短信等の個別書類(タイトル・提出日時・書類種別・リンク) |
| 調査履歴 | InvestigationHistory | ある銘柄について過去に実行した調査(Investigation)の時系列一覧 |
| 半自動調査 | Semi-automatic Investigation | ユーザーが銘柄を指定した契機でシステムが検索・判定まで自動実行するが、実行自体はユーザー操作を起点とする調査方式 |
| 検索プロバイダ | SearchProvider | Web検索・YouTube検索・SNS検索など、外部情報源への検索処理を抽象化したアダプタ |
| モックプロバイダ | MockSearchProvider | 外部APIキー未設定時に、開発・検証のためダミーの検索結果を返すプロバイダ実装 |
| 株価クライアント | JQuantsClient | J-Quants APIで銘柄の直近株価を取得するクライアント。認証情報未設定時はnullを返す |
| 開示書類クライアント | EdinetClient | EDINET APIで銘柄の直近開示書類一覧を取得するクライアント。日付単位の全銘柄共有キャッシュ(EdinetDailyDocuments)を介して証券コードで絞り込む |

## 2. UI/UX用語

| 日本語 | 英語(コード上の命名) | 定義 |
| --- | --- | --- |
| ウォッチリスト一覧画面 | WatchlistView | 監視銘柄を一覧表示するトップ画面 |
| 銘柄詳細画面 | StockDetailView | 1銘柄のシグナル要約と株価・財務データを表示する画面 |
| シグナル要約カード | SignalSummaryCard | 「数量↑/↓」「単価↑/↓」の判定と根拠リンクをまとめて表示するUI部品 |
| 調査履歴一覧画面 | InvestigationHistoryView | 銘柄ごとの過去の調査(Investigation)を時系列に一覧表示する画面 |
| 調査実行操作 | InvestigationTriggerControl | ユーザーが調査(Investigation)を開始するための操作UI(ボタン等) |
| データ更新操作 | MarketDataSyncControl | ユーザーが株価・開示書類データの取得を開始するための操作UI(ボタン等) |

## 3. 英語・日本語対応表(補足)

| 英語 | 日本語 | 備考 |
| --- | --- | --- |
| Stock | 銘柄 | Prismaモデル名は `Stock` |
| WatchlistItem | ウォッチリスト登録項目 | `Stock` と多対1(実質1対1運用) |
| Investigation | 調査 | `status`(実行中/完了/失敗)を持つ |
| Signal | シグナル | `signalType`, `direction`, `summary` を持つ |
| Evidence | 根拠情報 | `sourceType`, `url`, `title`, `snippet`, `publishedAt` を持つ |
| PriceFinancialData | 株価・財務データ | `price`/`priceSource`(J-Quants)、`disclosureDocuments`/`disclosureSource`(EDINET)を持つ。いずれも未取得の場合はnull |
| EdinetDailyDocuments | EDINET日次書類キャッシュ | EDINETの日付単位の書類一覧を全銘柄で共有キャッシュする内部エンティティ |

## 4. コード上の命名規則との関係

- 本用語集で定義した英語表記は、`docs/development-guidelines.md` の命名規則(PascalCase/camelCase)に従ってそのままコード上の識別子(Prismaモデル名、コンポーネント名、変数名)として使用する
- 新しいドメイン概念が登場した場合は、実装前に本ファイルへ追記し、日本語・英語の対応を明確にしてからコードに反映する
