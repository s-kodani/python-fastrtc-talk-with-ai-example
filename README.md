# AI Voice Chat

WebRTC によるリアルタイム AI 音声対話アプリ。ユーザーがマイクで話しかけると、AI が音声で応答します。

## 技術スタック

- **バックエンド**: Python 3.10+, FastAPI, FastRTC, OpenAI API, Pocket-TTS, Moonshine STT
- **フロントエンド**: React 18, TypeScript, Vite, Tailwind CSS

## セットアップ

### 1. 環境変数

```bash
export OPENAI_API_KEY="your-openai-api-key"
```

### 2. バックエンド

[uv](https://docs.astral.sh/uv/) を使用して依存関係をインストールします。

```bash
cd backend
uv sync
```

### 3. フロントエンド

```bash
cd frontend
npm install
npm run build
```

### 4. 起動

```bash
cd backend
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000
```

または `./backend/run.sh` を実行します。

ブラウザで http://localhost:8000 を開く。

## 開発モード

フロントエンドを開発サーバーで起動する場合:

```bash
# プロジェクト直下で一括起動（推奨）
./dev.sh
```

または、ターミナルを分けて起動:

```bash
# ターミナル1: バックエンド
cd backend && uv run uvicorn app.main:app --reload --port 8000

# ターミナル2: フロントエンド（/webrtc を 8000 にプロキシ）
cd frontend && npm run dev
```

フロントエンドは http://localhost:5173 で起動し、WebRTC リクエストはバックエンドにプロキシされます。終了時は Ctrl+C で両方停止します。

## テスト

### バックエンド

```bash
cd backend
uv run pytest tests/ -v
uv run pytest tests/ --cov=app --cov-report=term-missing
```

### フロントエンド

```bash
cd frontend
npm run test
npm run test:coverage
```

## ドキュメント

- [要件定義](docs/requirements.md)
- [フロントエンド画面構成](docs/frontend-screens.md)
- [バックエンドシーケンス](docs/backend-sequence.md)
