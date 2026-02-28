"""Tests for app.services.llm."""

from unittest.mock import MagicMock, patch

import pytest

from app.services import llm


class TestChatCompletion:
    # Given: 有効な user_message、OpenAI API が成功
    # When:  chat_completion() を呼ぶ
    # Then:  応答テキストが返る
    def test_returns_response_on_success(self, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "test-key")
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "Hello!"
        with patch.object(llm, "get_openai_client") as mock_get:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_get.return_value = mock_client
            result = llm.chat_completion("Hi")
        assert result == "Hello!"

    # Given: OpenAI API がエラーを返す
    # When:  chat_completion() を呼ぶ
    # Then:  例外が伝播する
    def test_raises_on_api_error(self, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "test-key")

        with patch.object(llm, "get_openai_client") as mock_get:
            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = Exception("API error")
            mock_get.return_value = mock_client
            with pytest.raises(Exception) as exc_info:
                llm.chat_completion("Hi")
            assert "API error" in str(exc_info.value)

    # Given: 応答の content が None
    # When:  chat_completion() を呼ぶ
    # Then:  空文字が返る
    def test_returns_empty_when_content_none(self, monkeypatch):
        monkeypatch.setenv("OPENAI_API_KEY", "test-key")
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = None
        with patch.object(llm, "get_openai_client") as mock_get:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_get.return_value = mock_client
            result = llm.chat_completion("Hi")
        assert result == ""
