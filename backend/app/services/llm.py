"""OpenAI Chat Completions service."""

import logging

from openai import OpenAI

from app.config import get_openai_api_key, get_openai_base_url

logger = logging.getLogger(__name__)
_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    """Get or create OpenAI client."""
    global _client
    if _client is None:
        kwargs: dict = {"api_key": get_openai_api_key()}
        base_url = get_openai_base_url()
        if base_url is not None:
            kwargs["base_url"] = base_url
        _client = OpenAI(**kwargs)
    return _client


def chat_completion(user_message: str) -> str:
    """
    Get AI response from OpenAI Chat Completions.

    Args:
        user_message: User's input text.

    Returns:
        Assistant's response text.

    Raises:
        openai.APIError: On API failure.
    """
    logger.info("OpenAI: リクエスト user_message=%r", user_message)

    client = get_openai_client()
    response = client.chat.completions.create(
        model="google/gemma-3-4b",
        messages=[{"role": "user", "content": user_message}],
        max_tokens=48,
    )
    content = response.choices[0].message.content or ""

    usage = getattr(response, "usage", None)
    if usage:
        logger.info(
            "OpenAI: レスポンス content=%r (prompt_tokens=%s, completion_tokens=%s)",
            content[:200] + "..." if len(content) > 200 else content,
            getattr(usage, "prompt_tokens", "-"),
            getattr(usage, "completion_tokens", "-"),
        )
    else:
        logger.info("OpenAI: レスポンス content=%r", content[:200] + "..." if len(content) > 200 else content)

    return content
