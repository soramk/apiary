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
  - `UrlImportModal.jsx`, `VerifyModal.jsx`, `ApiEditModal.jsx`: ダークな `glass` 背景を `bg-white` に変更し、テキスト色と入力フィールドのスタイルをライトテーマ向けに最適化。
  - `Playground.jsx`, `CodeGenerator.jsx`: ラベルや入力フィールド、コードブロックのヘッダー色を調整し、コントラストを改善。
  - `ApiGrid.jsx`: 空の状態（Empty State）のテキスト色を改善。
- **ステータス**: 完了 (Closed)
