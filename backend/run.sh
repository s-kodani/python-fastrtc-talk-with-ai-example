#!/bin/sh
cd "$(dirname "$0")"
exec uv run uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
