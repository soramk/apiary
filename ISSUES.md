# Project Issues

## [CLOSED] ヒーローセクションの視認性向上

- **内容**: ヒーローセクションのフォントカラー（text-white, text-slate-300）が背景のパステルカラーに対してコントラストが低く、読みづらくなっていた。
- **修正**:
  - "Bloom Your Ideas" を `text-white` から `text-slate-800` に変更。
  - 日本語の説明文を `text-slate-300` から `text-slate-600` に変更。
- **ステータス**: 完了 (Closed)

## [CLOSED] 詳細ビューおよび各種モーダルの視認性向上

- **内容**: `ApiDetail`, `Playground`, `CodeGenerator` および各種モーダル（URLインポート、再検証、編集）において、白系統のテキストや暗い背景要素が現在のパステルテーマ（明るい背景）と合っておらず、視認性が低かった。
- **修正**:
  - `ApiDetail.jsx`: テキスト色を `text-white`, `text-slate-300` から `text-slate-800`, `text-slate-600` 等の暗い色へ変更。サイドバーやタブの背景を調整。
  - `UrlImportModal.jsx`, `VerifyModal.jsx`, `ApiEditModal.jsx`: ダークな `glass` 背景を `bg-white` に変更し、テキスト色と入力フィールドのスタイルをライトテーマ向けに最適化。特に `VerifyModal` の再検証時の注意事項やステータス表示のコントラストを大幅に強化。
  - `Playground.jsx`, `CodeGenerator.jsx`: ラベルや入力フィールド、コードブロックのヘッダー色を調整し、コントラストを改善。
  - `ApiGrid.jsx`: 空の状態（Empty State）のテキスト色を改善。
- **ステータス**: 完了 (Closed)

## [CLOSED] お気に入り・タグ付け機能の追加

- **内容**: APIの整理を容易にするため、お気に入り登録機能とユーザー独自のタグ付け機能が必要であった。
- **実装**:
  - `App.jsx`: お気に入り・タグによるフィルタリングロジックの実装。
  - `Sidebar.jsx`: お気に入りトグルの追加、タグ別グルーピングの実装。
  - `ApiCard.jsx`: ハートアイコンによるお気に入り切り替え、タグ表示の実装。
  - `ApiDetail.jsx`: ヘッダーでのお気に入り操作、サイドバーでのタグ管理（追加・削除）機能の実装。
- **ステータス**: 完了 (Closed)

## [CLOSED] AI再検証におけるJSONパースエラーの修正

- **内容**: AI再検証（`verifyApiInfo`）において、Geminiからの応答が正しくない形式のJSONである場合に `Expected ',' or '}' after property value` というエラーが発生する。
- **原因**:
  - AIが文字列内でダブルクォートのエスケープを忘れた。
  - 応答がトークン制限により途中で切れた。
  - 文字列内に生のリターンが含まれている。
- **修正**:
  - `src/services/gemini.js` に堅牢なパース処理を行う `parseAiJson` Helper関数を導入。
    - Markdownコードブロック（```json）の除去に対応。
    - 末尾の不要なカンマの自動修正機能を追加。
    - JSONパース失敗時の予備処理（制御文字の除去など）を実装。
  - `verifyApiInfo` のプロンプトを強化し、ダブルクォートのエスケープや改行の扱いについてAIに厳密な指示を出すように変更。
- **ステータス**: 完了 (Closed)
