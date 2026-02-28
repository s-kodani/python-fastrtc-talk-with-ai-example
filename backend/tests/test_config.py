"""Tests for app.config."""

import os

import pytest

from app.config import get_openai_api_key, get_openai_base_url, get_port


class TestGetOpenAIApiKey:
    # Given: OPENAI_API_KEY が設定されている
    # When:  get_openai_api_key() を呼ぶ
    # Then:  キーが返る
    def test_returns_key_when_set(self, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "sk-test-123")
        assert get_openai_api_key() == "sk-test-123"

    # Given: OPENAI_API_KEY が未設定
    # When:  get_openai_api_key() を呼ぶ
    # Then:  ValueError が発生する
    def test_raises_when_unset(self, monkeypatch):
        monkeypatch.delenv("OPENAI_API_KEY", raising=False)
        with pytest.raises(ValueError) as exc_info:
            get_openai_api_key()
        assert "OPENAI_API_KEY" in str(exc_info.value)

    # Given: OPENAI_API_KEY が空文字
    # When:  get_openai_api_key() を呼ぶ
    # Then:  ValueError が発生する
    def test_raises_when_empty(self, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "")
        with pytest.raises(ValueError) as exc_info:
            get_openai_api_key()
        assert "OPENAI_API_KEY" in str(exc_info.value)


class TestGetOpenAIBaseUrl:
    # Given: OPENAI_BASE_URL が未設定
    # When:  get_openai_base_url() を呼ぶ
    # Then:  None が返る
    def test_returns_none_when_unset(self, monkeypatch):
        monkeypatch.delenv("OPENAI_BASE_URL", raising=False)
        assert get_openai_base_url() is None

    # Given: OPENAI_BASE_URL が空文字
    # When:  get_openai_base_url() を呼ぶ
    # Then:  None が返る
    def test_returns_none_when_empty(self, monkeypatch):
        monkeypatch.setenv("OPENAI_BASE_URL", "")
        assert get_openai_base_url() is None

    # Given: OPENAI_BASE_URL が設定されている
    # When:  get_openai_base_url() を呼ぶ
    # Then:  URL が返る
    def test_returns_url_when_set(self, monkeypatch):
        monkeypatch.setenv("OPENAI_BASE_URL", "https://api.example.com/v1")
        assert get_openai_base_url() == "https://api.example.com/v1"


class TestGetPort:
    # Given: PORT が未設定
    # When:  get_port() を呼ぶ
    # Then:  8000 が返る
    def test_returns_default_when_unset(self, monkeypatch):
        monkeypatch.delenv("PORT", raising=False)
        assert get_port() == 8000

    # Given: PORT=3000 が設定
    # When:  get_port() を呼ぶ
    # Then:  3000 が返る
    def test_returns_env_value_when_set(self, monkeypatch):
        monkeypatch.setenv("PORT", "3000")
        assert get_port() == 3000
