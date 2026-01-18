# Apiary (エイピアリー)

🐝 **養蜂場（Apiary）** - AIが蜂のように飛び回り、Web APIという蜜を集める場所

Gemini AIを活用してWeb APIを調査・整理し、あなただけのAPIコレクションを構築する次世代型APIマネジメント・ツールです。

## 🌟 主な特徴

- ✨ **透明性のあるAI体験**: どのアクションがAI（トークン）を消費するかを明確に表示。安心して利用できます。
- 🎨 **プレミアム・デザイン**: パステルカラーとグラデーションを基調とした、モダンで洗練されたユーザーインターフェース。
- 🔐 **プライバシー重視**: 保存データはすべてブラウザ（IndexedDB）に完結。外部サーバーにデータは送信されません。

## 🚀 主要機能

### 🔍 API探索・収集

- **AI検索**: キーワードからGemini AIが世界中のAPIを調査し、最適な「蜜」を見つけ出します。
- **URLからAI分析**: 開発ドキュメントや公式サイトのURLを入力するだけで、Geminiが自動的にAPIエンドポイントや認証情報を抽出します。

### 🛠️ 開発サポート

- **堅牢なコード生成**: シニアエンジニアレベルの高品質なサンプルコードを生成。
  - 対応：Python, Node.js, JS (Fetch), TypeScript, PowerShell, エクセルマクロ (VBA), Google Apps Script (GAS), cURL
  - ベストプラクティスに基づいたエラーハンドリングと型定義を含む実行可能なコード。
- **Playground**: 直感的なUIでAPIリクエストをテスト。レスポンスや履歴を即座に確認。

### 📊 管理・運用

- **AIステータス監視**: APIの最新稼働状況、変更点、EOL（提供終了）情報をAIが追跡。
- **AI再検証**: 既存のAPIデータが最新かどうかをワンクリックでAIが再確認。
- **履歴の分類表示**: 検索履歴、AI分析、コード生成などのアクションをアイコン別に整理。統計情報も可視化。
- **柔軟な管理**: タグ付け、お気に入り登録、JSON/CSV/Markdown形式でのエクスポート機能。

## 🛠️ 技術スタック

- **Core**: React 18 + Vite
- **Styling**: Vanilla CSS (Premium Pastel Theme) & Tailwind CSS
- **Icons**: Lucide React (Unified AI Indicators)
- **AI Engine**: Google Gemini API (Flash/Pro)
- **Data Persistence**: IndexedDB (Local only)

## 🏁 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

### 3. Gemini APIキーの設定

1. [Google AI Studio](https://aistudio.google.com/app/apikey)でAPIキーを取得。
2. アプリの設定ボタン（右上の歯車アイコン）からAPIキーを登録。

## 💡 コンセプト

- 🐝 **蜂 (Bee)** = 世界中を飛び回り情報を集める Gemini AI
- 🍯 **蜜 (Honey)** = 集められた価値あるAPI情報
- 🏠 **巣箱 (Hive)** = あなたが構築したAPIデータベース

## 📄 ライセンス

MIT
