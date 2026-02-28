"""Text-to-Speech service using Pocket-TTS."""

import logging
from typing import TYPE_CHECKING

import numpy as np

if TYPE_CHECKING:
    from pocket_tts import TTSModel

logger = logging.getLogger(__name__)
OUTPUT_SAMPLE_RATE = 24000
FRAME_SAMPLES = 4800  # 0.2 seconds at 24kHz


def get_tts_model() -> "TTSModel":
    """Get Pocket-TTS model. Lazy import."""
    from pocket_tts import TTSModel

    return TTSModel.load_model()


def get_voice_state(model: "TTSModel", voice: str = "alba"):
    """Get voice state for given preset voice."""
    return model.get_state_for_audio_prompt(voice)


def generate_audio_chunks(
    text: str,
    voice: str = "alba",
) -> list[tuple[int, np.ndarray]]:
    """
    Generate audio from text and yield as chunks for streaming.

    Returns list of (sample_rate, np.ndarray) with shape (1, num_samples).
    Output is resampled to OUTPUT_SAMPLE_RATE (24000) if needed.
    """
    logger.info("TTS: 入力 text=%r, voice=%s", text[:100] + "..." if len(text) > 100 else text, voice)

    model = get_tts_model()
    sample_rate = model.sample_rate
    voice_state = get_voice_state(model, voice)
    audio_np = model.generate_audio(voice_state, text).numpy()
    audio_np = np.clip(audio_np, -1.0, 1.0).astype(np.float32)

    chunk_size = int(sample_rate * 0.6)
    chunks = [
        (sample_rate, audio_np[i:i + chunk_size])
        for i in range(0, len(audio_np), chunk_size)
    ]
    logger.info("TTS: 出力 chunks=%d, total_samples=%d, duration=%.2fs", len(chunks), len(audio_np), len(audio_np) / sample_rate)

    return chunks
