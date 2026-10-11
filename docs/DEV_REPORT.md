# 開発記録 (APP 002 TOMORI IDEA)

## 実装済み
- 必須機能 A〜F(登録・一覧・編集削除・検索絞り込み・ステータス・端末内保存)
- 日本語UI、アイボリー+深緑、iPhone/PCレスポンシブ
- GitHub Actions: CI(型チェック・テスト・Web版ビルド・E2E)、Pages自動公開(mainのみ)
- README / 利用説明書(端末間でデータ非共有を明記)

## テスト結果
| 項目 | 結果 | 方法 |
|---|---|---|
| 型チェック | 成功 | `npm run typecheck` |
| ユニットテスト 8件 | 成功 | `npm test` |
| Web版ビルド | 成功 | `npm run build:web` |
| 新規登録/表示/編集/削除・キャンセル/検索/絞り込み/リロード保持/iPhone幅(390px)/PC幅 | 成功(E2E 11件) | `node scripts/e2e.mjs`(Chromium) |

## 未確認
- iPhone実機(Safari)・Expo Goでの表示と操作(エミュレートのみ)
- GitHub Pages上での実公開(管理者のPages設定とmainマージが必要)
- GitHub Actions上でのCI実行結果(PR作成後に確認)
- iOSネイティブビルド(未実施)

## 未完了・今後の改善案
- JSONでのエクスポート/インポート(端末間の引き継ぎ)
- タグ、ピン留め、並び替え切替、ステータスのクイック変更
- ブラウザの戻るボタン対応(現状は画面内の戻るボタン)
- iOSアプリ化(EAS Build。Apple Developer Programが別途必要)
