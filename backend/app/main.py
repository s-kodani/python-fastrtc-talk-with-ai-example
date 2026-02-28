"""FastAPI application entry point."""

import logging

from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import get_port
from app.stream import stream

app = FastAPI(title="AI Voice Chat", version="0.1.0")

stream.mount(app)

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
