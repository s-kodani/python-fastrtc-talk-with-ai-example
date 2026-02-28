"""FastAPI application entry point."""

import json
import logging

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_port
from app.stream import stream

app = FastAPI(title="AI Voice Chat", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

stream.mount(app)


@app.get("/api/updates")
async def stream_updates(webrtc_id: str):
    """Output Hooks: 文字起こしとAI応答をSSEでストリーミング."""

    async def output_stream():
        async for output in stream.output_stream(webrtc_id):
            payload = {"transcription": output.args[0], "response": output.args[1]}
            yield f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        output_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

# Serve frontend static files (built from frontend/)
frontend_dist = Path(__file__).resolve().parent.parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")
else:

    @app.get("/")
    async def _root():
        return {"message": "Frontend not built. Run: cd frontend && npm run build"}


def main() -> None:
    """Run the server."""
    import uvicorn

    port = get_port()
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)


if __name__ == "__main__":
    main()
