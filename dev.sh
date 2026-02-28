#!/bin/sh
# バックエンドとフロントエンドを一括起動する開発用スクリプト
# 終了時は Ctrl+C で両方停止

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PID=""

cleanup() {
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  exit 0
}

trap cleanup INT TERM

echo "Starting backend (http://localhost:8000) and frontend (http://localhost:5173)..."
echo "Press Ctrl+C to stop both."
echo ""

cd "$ROOT/backend"
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd "$ROOT/frontend"
npm run dev
