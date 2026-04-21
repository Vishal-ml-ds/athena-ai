"""Voice endpoints — transcription and text-to-speech.

Sprint 4: Basic voice pipeline (transcribe audio → agent → TTS response).
Full WebSocket real-time voice comes later.

Uses OpenAI native API for audio (Whisper + TTS) because the Euri gateway
does not expose /audio/transcriptions or /audio/speech. Falls back to 501
if OPENAI_API_KEY is not set so the rest of the app stays healthy."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel, Field

from app.core.config import get_settings
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext


class SynthesizeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=4096)
    voice: str = Field(default="alloy", max_length=20)

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


@router.post("/transcribe", response_model=ApiResponse[dict])
async def transcribe_audio(
    file: UploadFile = File(...),
    ctx: TenantContext = Depends(get_current_user),
):
    """Transcribe an audio file to text via OpenAI Whisper."""
    settings = get_settings()
    if not settings.openai_api_key:
        return ApiResponse(
            success=False,
            error={"code": "TRANSCRIPTION_DISABLED", "message": "Voice transcription is not configured."},
        )

    audio_bytes = await file.read()

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.openai_base_url}/audio/transcriptions",
                headers={"Authorization": f"Bearer {settings.openai_api_key}"},
                files={"file": (file.filename or "audio.webm", audio_bytes, file.content_type or "audio/webm")},
                data={"model": "whisper-1"},
            )

            if response.status_code == 200:
                return ApiResponse(success=True, data={"text": response.json().get("text", "")})

            return ApiResponse(
                success=False,
                error={
                    "code": "TRANSCRIPTION_FAILED",
                    "message": f"Transcription failed: {response.status_code} {response.text[:200]}",
                },
            )

    except Exception as e:
        return ApiResponse(
            success=False,
            error={"code": "TRANSCRIPTION_ERROR", "message": str(e)[:200]},
        )


@router.post("/synthesize", response_model=ApiResponse[dict])
async def synthesize_speech(
    body: SynthesizeRequest,
    ctx: TenantContext = Depends(get_current_user),
):
    """Convert text to speech via OpenAI TTS. Returns base64-encoded MP3."""
    settings = get_settings()
    if not settings.openai_api_key:
        return ApiResponse(
            success=False,
            error={"code": "TTS_DISABLED", "message": "Text-to-speech is not configured."},
        )

    # OpenAI TTS accepts a fixed set of voices — fall back to alloy for unknown values.
    allowed_voices = {"alloy", "echo", "fable", "onyx", "nova", "shimmer"}
    voice = body.voice if body.voice in allowed_voices else "alloy"

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.openai_base_url}/audio/speech",
                headers={
                    "Authorization": f"Bearer {settings.openai_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "tts-1",
                    "input": body.text[:4000],
                    "voice": voice,
                },
            )

            if response.status_code == 200:
                import base64
                audio_b64 = base64.b64encode(response.content).decode()
                return ApiResponse(success=True, data={"audio": audio_b64, "format": "mp3"})

            return ApiResponse(
                success=False,
                error={
                    "code": "TTS_FAILED",
                    "message": f"TTS failed: {response.status_code} {response.text[:200]}",
                },
            )

    except Exception as e:
        return ApiResponse(
            success=False,
            error={"code": "TTS_ERROR", "message": str(e)[:200]},
        )
