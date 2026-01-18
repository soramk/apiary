# Apiary (エイピアリー)

🐝 **養蜂場（Apiary）** - AIが蜂のように飛び回り、Web APIという蜜を集める場所

Gemini AIを活用してWeb APIを調査・整理し、あなただけのAPIデータベースを構築するReactアプリケーションです。

## コンセプト

**Apiary** = 養蜂場

- 🐝 **蜂（Bee）** = AI が世界中を飛び回る
- 🍯 **蜜（Honey）** = 集められたAPI情報・データ
- 🏠 **巣箱（Hive）** = ローカルに保存されるデータベース

## 機能

- 🔍 **AI検索**: キーワードからGemini AIが関連APIを調査
- 💾 **ローカル保存**: IndexedDBでブラウザにデータを永続化
- 🧪 **Playground**: ブラウザ上でAPIリクエストをテスト
- 🔧 **コード生成**: Python/Node.js/PowerShell/cURLのサンプルコード自動生成
- 📊 **ステータス監視**: APIの変更やEOL情報を追跡
- 📁 **インポート/エクスポート**: JSON/CSV/Markdown形式でデータ管理

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

### 3. Gemini APIキーの設定

1. [Google AI Studio](https://aistudio.google.com/app/apikey)でAPIキーを取得
2. アプリの設定画面からAPIキーを登録

## 技術スタック

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI**: Google Gemini API
- **Database**: IndexedDB

## ライセンス

MIT
