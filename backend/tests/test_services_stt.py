"""Tests for app.services.stt."""

from unittest.mock import MagicMock, patch

import numpy as np

from app.services.stt import transcribe


class TestTranscribe:
    # Given: 有効な audio tuple、STT がテキストを返す
    # When:  transcribe() を呼ぶ
    # Then:  テキストが返る
    def test_returns_text_on_success(self):
        audio = (16000, np.zeros((1, 1600), dtype=np.int16))
        with patch("app.services.stt.get_stt_model") as mock_get:
            mock_model = MagicMock()
            mock_model.stt.return_value = "hello"
            mock_get.return_value = mock_model
            result = transcribe(audio)
        assert result == "hello"

    # Given: STT が例外を投げる
    # When:  transcribe() を呼ぶ
    # Then:  空文字が返る
    def test_returns_empty_on_exception(self):
        audio = (16000, np.zeros((1, 1600), dtype=np.int16))
        with patch("app.services.stt.get_stt_model") as mock_get:
            mock_model = MagicMock()
            mock_model.stt.side_effect = RuntimeError("STT failed")
            mock_get.return_value = mock_model
            result = transcribe(audio)
        assert result == ""

    # Given: STT が None を返す
    # When:  transcribe() を呼ぶ
    # Then:  空文字が返る
    def test_returns_empty_when_stt_returns_none(self):
        audio = (16000, np.zeros((1, 1600), dtype=np.int16))
        with patch("app.services.stt.get_stt_model") as mock_get:
            mock_model = MagicMock()
            mock_model.stt.return_value = None
            mock_get.return_value = mock_model
            result = transcribe(audio)
        assert result == ""
