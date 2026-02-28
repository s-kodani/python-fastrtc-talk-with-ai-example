"""FastRTC Stream with ReplyOnPause handler."""

import logging

import numpy as np
from fastrtc import ReplyOnPause, Stream, AlgoOptions

from app.services.llm import chat_completion
from app.services.stt import transcribe
from app.services.tts import generate_audio_chunks

logger = logging.getLogger(__name__)

FALLBACK_NO_SPEECH = "I didn't catch that. Could you please try again?"
FALLBACK_LLM_ERROR = "Sorry, I'm having trouble connecting. Please try again."
FALLBACK_TTS_ERROR = "Sorry, I couldn't generate a response. Please try again."


def _response(audio: tuple[int, np.ndarray]):
    """
    ReplyOnPause handler: STT -> LLM -> TTS pipeline.

    Receives accumulated audio on pause, transcribes, gets LLM response,
    generates TTS audio, and yields chunks.
    """
    logger.info("Pipeline: 開始（音声受信）")

    text = transcribe(audio)
    if not text:
        response_text = FALLBACK_NO_SPEECH
        logger.info("Pipeline: STT 結果空 → fallback=%r", FALLBACK_NO_SPEECH)
    else:
        try:
            response_text = chat_completion(text)
            if not response_text.strip():
                response_text = FALLBACK_LLM_ERROR
                logger.info("Pipeline: OpenAI 空応答 → fallback=%r", FALLBACK_LLM_ERROR)
            else:
                logger.info("Pipeline: LLM 応答取得済み")
        except Exception as e:
            logger.exception("OpenAI API error: %s", e)
            response_text = FALLBACK_LLM_ERROR

    try:
        chunks = generate_audio_chunks(response_text)
        logger.info("Pipeline: TTS 完了 chunks=%d → ストリーミング開始", len(chunks))
    except Exception as e:
        logger.exception("Pocket-TTS error: %s", e)
        try:
            chunks = generate_audio_chunks(FALLBACK_TTS_ERROR)
            logger.info("Pipeline: TTS fallback で再試行")
        except Exception:
            logger.error("Pipeline: TTS fallback も失敗 → 終了")
            return

    for chunk in chunks:
        yield chunk
    logger.info("Pipeline: 完了（全チャンク送信済み）")


stream = Stream(
    handler=ReplyOnPause(
        _response,
        algo_options=AlgoOptions(
            audio_chunk_duration=0.6,
            started_talking_threshold=0.2,
            speech_threshold=0.1
        ),
    ),
    server_rtc_configuration={
        "iceServers": [
            {
                "urls": ["stun:stun.l.google.com:19302"],
            },
        ],
    },
    modality="audio",
    mode="send-receive",
)
