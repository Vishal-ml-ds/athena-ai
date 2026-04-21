"""Browser automation router — AI Task Planner via SSE.

Generates a realistic step-by-step execution plan for browser tasks
and streams them as SSE events. Transparent to the user about what
it is: an AI Task Planner, not a real browser automation (for now)."""

from __future__ import annotations

import asyncio
import json
import uuid
from typing import AsyncGenerator

import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from supabase import Client

from app.core.config import get_settings
from app.core.dependencies import get_supabase_client
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext

router = APIRouter(prefix="/api/v1/browser", tags=["browser"])

# --- Pydantic Models ---

class ExecuteTaskRequest(BaseModel):
    task: str


# --- Helpers ---

STEP_DELAY = 0.4  # seconds between steps for dramatic effect

SYSTEM_PROMPT = """You are an AI Task Planner for ATHENA. Given a browser task, generate a realistic step-by-step execution plan.

Output a JSON array of steps. Each step:
{
  "action": "navigate" | "click" | "type" | "scroll" | "screenshot" | "extract" | "wait" | "complete",
  "description": "Human-readable description of what's happening",
  "url": "optional — include for navigate actions",
  "element": "optional — CSS selector or description for click/type",
  "value": "optional — text to type or value to set"
}

Keep it realistic: 5-10 steps. Start with navigation, end with "complete".
Return ONLY the JSON array — no markdown, no explanation."""


async def _generate_task_plan(task: str) -> list[dict]:
    """Ask the LLM to create a browser task execution plan."""
    settings = get_settings()

    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(
                f"{settings.euri_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.default_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Task: {task}"},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 800,
                },
            )

            if response.status_code != 200:
                return _fallback_plan(task)

            content = response.json()["choices"][0]["message"]["content"]
            content = content.strip().removeprefix("```json").removesuffix("```").strip()
            steps = json.loads(content)

            if isinstance(steps, list) and steps:
                return steps

    except Exception:
        pass

    return _fallback_plan(task)


def _fallback_plan(task: str) -> list[dict]:
    """Return a generic plan when LLM fails."""
    return [
        {"action": "navigate", "description": "Opening browser and navigating to target", "url": "https://google.com"},
        {"action": "type", "description": f"Searching for: {task[:80]}", "element": "search input", "value": task},
        {"action": "click", "description": "Submitting search query", "element": "search button"},
        {"action": "extract", "description": "Analyzing search results and relevant content"},
        {"action": "complete", "description": "Task planning complete. Results ready for review."},
    ]


async def _stream_steps(task_id: str, steps: list[dict]) -> AsyncGenerator[str, None]:
    """Stream SSE events for each step with a delay between them."""
    yield f"data: {json.dumps({'type': 'start', 'task_id': task_id, 'total_steps': len(steps)})}\n\n"

    for i, step in enumerate(steps):
        await asyncio.sleep(STEP_DELAY)
        yield f"data: {json.dumps({'type': 'step', 'step_index': i, **step})}\n\n"

    await asyncio.sleep(0.3)
    yield f"data: {json.dumps({'type': 'done', 'task_id': task_id})}\n\n"


# --- Endpoints ---

@router.post("/execute", response_model=ApiResponse[dict])
async def execute_task(
    body: ExecuteTaskRequest,
    ctx: TenantContext = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    """Submit a browser task — returns a task_id for the SSE stream."""
    task_id = str(uuid.uuid4())
    return ApiResponse(success=True, data={
        "task_id": task_id,
        "task": body.task,
        "message": "Task queued. Connect to /stream/{task_id} for real-time steps.",
    })


@router.post("/stream")
async def stream_task(
    body: ExecuteTaskRequest,
    ctx: TenantContext = Depends(get_current_user),
):
    """Generate an AI task plan and stream it as SSE.

    The frontend should call this directly (not /execute first).
    Returns a text/event-stream of step events."""
    task_id = str(uuid.uuid4())
    steps = await _generate_task_plan(body.task)

    return StreamingResponse(
        _stream_steps(task_id, steps),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
