"""Speech-to-Text service using FastRTC moonshine model."""

import logging
from typing import TYPE_CHECKING

import numpy as np

if TYPE_CHECKING:
    from fastrtc import STTModel

logger = logging.getLogger(__name__)


def get_stt_model() -> "STTModel":
    """Get STT model (moonshine/base). Lazy import to avoid circular deps."""
    from fastrtc import get_stt_model as _get_stt_model

    return _get_stt_model(model="moonshine/base")


def transcribe(audio: tuple[int, np.ndarray]) -> str:
    """
    Transcribe audio to text.

    Args:
        audio: Tuple of (sample_rate, np.ndarray) with shape (1, num_samples).

    Returns:
        Transcribed text. Empty string if recognition fails or audio is empty.
    """
    sample_rate, arr = audio
    num_samples = arr.shape[1] if arr.ndim > 1 else len(arr)
    duration_sec = num_samples / sample_rate if sample_rate > 0 else 0
    logger.info(
        "STT: 入力 audio sample_rate=%d, samples=%d, duration=%.2fs",
        sample_rate,
        num_samples,
        duration_sec,
    )

    model = get_stt_model()
    try:
        text = model.stt(audio)
        result = (text or "").strip()
        if result:
            logger.info("STT: 認識結果 text=%r", result)
        else:
            logger.info("STT: 認識結果 空（音声なし or 認識失敗）")
        return result
    except Exception as e:
        logger.warning("STT: 認識中に例外発生 %s: %s", type(e).__name__, e)
        return ""
