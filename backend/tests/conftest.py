"""Pytest configuration and fixtures."""

import os

import pytest


@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    """Reset env vars that tests might modify."""
    yield
    # Cleanup if needed
    if "OPENAI_API_KEY" in os.environ and os.environ["OPENAI_API_KEY"] == "test-key":
        del os.environ["OPENAI_API_KEY"]
