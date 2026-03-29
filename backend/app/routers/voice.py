"""Voice endpoints — transcription and text-to-speech.

Sprint 4: Basic voice pipeline (transcribe audio → agent → TTS response).
Full WebSocket real-time voice comes later."""

import json

import httpx
from fastapi import APIRouter, Depends, UploadFile, File
from supabase import Client

from app.core.config import get_settings
from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext

router = APIRouter(prefix="/api/v1/voice", tags=["voice"])


@router.post("/transcribe", response_model=ApiResponse[dict])
async def transcribe_audio(
    file: UploadFile = File(...),
    ctx: TenantContext = Depends(get_current_user),
):
    """Transcribe an audio file to text using Euri AI (Whisper-compatible)."""
    settings = get_settings()

    audio_bytes = await file.read()

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.euri_base_url}/audio/transcriptions",
                headers={"Authorization": f"Bearer {settings.euri_api_key}"},
                files={"file": (file.filename or "audio.webm", audio_bytes, file.content_type or "audio/webm")},
                data={"model": "whisper-1"},
            )

            if response.status_code == 200:
                result = response.json()
                return ApiResponse(
                    success=True,
                    data={"text": result.get("text", "")},
                )

            return ApiResponse(
                success=False,
                error={"code": "TRANSCRIPTION_FAILED", "message": f"Transcription failed: {response.status_code}"},
            )

    except Exception as e:
        return ApiResponse(
            success=False,
            error={"code": "TRANSCRIPTION_ERROR", "message": str(e)[:200]},
        )


@router.post("/synthesize", response_model=ApiResponse[dict])
async def synthesize_speech(
    body: dict,
    ctx: TenantContext = Depends(get_current_user),
):
    """Convert text to speech using Euri AI TTS."""
    settings = get_settings()
    text = body.get("text", "")
    voice = body.get("voice", "alloy")

    if not text:
        return ApiResponse(
            success=False,
            error={"code": "VALIDATION_ERROR", "message": "Text is required"},
        )

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.euri_base_url}/audio/speech",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "tts-1",
                    "input": text[:4000],
                    "voice": voice,
                },
            )

            if response.status_code == 200:
                # Return base64 encoded audio
                import base64
                audio_b64 = base64.b64encode(response.content).decode()
                return ApiResponse(
                    success=True,
                    data={
                        "audio": audio_b64,
                        "format": "mp3",
                    },
                )

            return ApiResponse(
                success=False,
                error={"code": "TTS_FAILED", "message": f"TTS failed: {response.status_code}"},
            )

    except Exception as e:
        return ApiResponse(
            success=False,
            error={"code": "TTS_ERROR", "message": str(e)[:200]},
        )
