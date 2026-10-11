# TOMORI IDEA

**TOMORI APP LAB 第2号アプリ** — 思いついたアイデアを、簡単に記録・整理・検索できるアイデア管理アプリ。

サーバー・ログイン・有料API・外部通信は一切不要。データはすべて端末(ブラウザ)内に保存されます。
**端末やブラウザを変えるとデータは共有されません。**

公開URL: https://tomoricot-alt.github.io/tomori-idea-002/

## 機能

- アイデアの登録(タイトル・内容・カテゴリ・ステータス、登録/更新日時を自動記録)
- 一覧表示(カード形式・新しい順・カテゴリとステータスのバッジ)、タップで詳細へ
- 編集・削除(削除前に確認ダイアログ)
- タイトルと本文のキーワード検索(スペース区切りでAND)、カテゴリ・ステータス絞り込み
- ステータス管理: アイデア / 検討中 / 実行済み
- 端末内保存(AsyncStorage。Webではブラウザの localStorage)、再読み込み後も保持
- 空タイトルの入力チェック、保存失敗時のエラー表示(失敗時は画面に反映せず入力内容を保持)
- 日本語UI / iPhone対応 / PCでは中央寄せのレスポンシブ表示

利用者向け説明書: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)　開発記録: [docs/DEV_REPORT.md](docs/DEV_REPORT.md)

## 技術構成

React Native / Expo (SDK 57) / TypeScript。Web版は `react-native-web` で出力し、将来のiOSアプリ化にも同一コードを使えます(APP 001 TOMORI FOCUS と同構成)。

```
App.tsx                  状態管理・画面切替(一覧/詳細/フォーム)
src/lib/ideas.ts         アイデアの純粋ロジック(登録・更新・削除・検索・検証)
src/lib/storage.ts       端末内保存(AsyncStorage)
src/screens/             ListScreen / DetailScreen / FormScreen
src/components/ui.tsx    共通UI(Button/Chip/Badge/Page/ConfirmDialog) ※他アプリへ流用可
src/components/IdeaCard  アイデアカード
src/theme.ts             配色(アイボリー+深緑)
scripts/                 Web版のE2E確認・dist配信スクリプト
```

設計メモ: 画面遷移ライブラリは使わず `App.tsx` の状態で切り替えています(小規模のため)。確認ダイアログは `Alert.alert` がWebで動作しないため `Modal` で自作しています。

## 起動方法

Node.js 20 以上が必要です。

```bash
npm install
npm run web      # ブラウザで開く
npm start        # Expo開発サーバー(QRコードを Expo Go で読み取ればiPhone実機でも確認可)
npm run ios      # iOSシミュレーター(macOS + Xcode が必要)
```

## テスト手順

```bash
npm run typecheck    # 型チェック
npm test             # ユニットテスト(登録・更新・削除・検索・絞り込み・検証)
npm run build:web    # Web版ビルド(dist/ に出力)

# ブラウザでの動作確認(E2E)。事前に build:web を実行
npx playwright-core install chromium   # 初回のみ
node scripts/e2e.mjs                   # 既存のChromiumを使う場合は CHROMIUM_PATH=/path/to/chromium
```

E2E は iPhone相当(390×844)で、新規登録・一覧表示・並び順・検索・絞り込み・編集・削除(キャンセル/実行)・リロード後の保持・横スクロールなし、およびPC幅(1280px)の表示を自動確認します。

GitHub Actions(`.github/workflows/ci.yml`)が Pull Request と作業ブランチへの push で、型チェック・ユニットテスト・Web版ビルド・E2E を自動実行します。

## GitHub Pages への公開手順

Web版は `https://tomoricot-alt.github.io/tomori-idea-002/` で公開されます(`app.json` の `experiments.baseUrl` で設定済み)。

**初回のみ(リポジトリ管理者の操作)** ※APP 001で初期設定のつまずきがあったため、必ず先に行ってください

1. GitHub のリポジトリ → **Settings → Pages**
2. **Build and deployment → Source** を **GitHub Actions** に変更(「Deploy from a branch」のままだと公開されません)
3. PRを承認して `main` にマージ(または Actions タブ →「Deploy to GitHub Pages」→ *Run workflow*)
4. Actions の完了後、上記URLを開いて確認

> Pagesが未設定の状態でデプロイを実行すると `Get Pages site failed` / `HttpError: Not Found` で失敗します。手順2の後に、失敗したワークフローを *Re-run* すれば解決します。
> 非公開リポジトリで Pages を使うには GitHub の有料プランが必要な場合があります。

**以降は自動**: `main` にマージされると `.github/workflows/deploy-pages.yml` が型チェック・テスト・ビルドを行い自動公開します。

> リポジトリ名を変える場合は `app.json` の `baseUrl` と `scripts/serve-dist.mjs`・`scripts/e2e.mjs` のパスも変更してください。

### iPhone でホーム画面に追加する

Safari で公開URLを開き、共有ボタン →「ホーム画面に追加」。
