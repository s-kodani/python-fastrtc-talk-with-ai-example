"""Tests for app.services.tts."""

from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from app.services.tts import OUTPUT_SAMPLE_RATE, generate_audio_chunks


class TestGenerateAudioChunks:
    # Given: 有効な text、TTS が音声を返す
    # When:  generate_audio_chunks() を呼ぶ
    # Then:  (sample_rate, np.ndarray) のリストが返る
    def test_returns_chunks_on_success(self):
        mock_audio = np.zeros(4800, dtype=np.float32)
        mock_tensor = MagicMock()
        mock_tensor.numpy.return_value = mock_audio
        with patch("app.services.tts.get_tts_model") as mock_get:
            mock_model = MagicMock()
            mock_model.sample_rate = 24000
            mock_model.get_state_for_audio_prompt.return_value = MagicMock()
            mock_model.generate_audio.return_value = mock_tensor
            mock_get.return_value = mock_model
            result = generate_audio_chunks("Hello")
        assert len(result) >= 1
        for sr, arr in result:
            assert sr == OUTPUT_SAMPLE_RATE
            assert arr.ndim == 1
            assert arr.dtype == np.float32

    # Given: TTS が例外を投げる
    # When:  generate_audio_chunks() を呼ぶ
    # Then:  例外が伝播する
    def test_raises_on_tts_error(self):
        with patch("app.services.tts.get_tts_model") as mock_get:
            mock_model = MagicMock()
            mock_model.get_state_for_audio_prompt.return_value = MagicMock()
            mock_model.generate_audio.side_effect = RuntimeError("TTS failed")
            mock_get.return_value = mock_model
            with pytest.raises(RuntimeError):
                generate_audio_chunks("Hello")
