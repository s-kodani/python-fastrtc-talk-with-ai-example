"""Application configuration from environment variables."""

import os


def get_openai_api_key() -> str:
    """Get OpenAI API key from environment."""
    key = os.environ.get("OPENAI_API_KEY")
    if not key or not key.strip():
        raise ValueError(
            "OPENAI_API_KEY environment variable is required but not set."
        )
    return key.strip()


def get_openai_base_url() -> str | None:
    """Get OpenAI API base URL from environment (optional)."""
    url = os.environ.get("OPENAI_BASE_URL")
    if not url or not url.strip():
        return None
    return url.strip()


def get_port() -> int:
    """Get server port from environment (default: 8000)."""
    return int(os.environ.get("PORT", "8000"))
