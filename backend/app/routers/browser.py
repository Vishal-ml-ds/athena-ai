"""Browser automation router — real Playwright headless Chromium on Modal.

Given a natural-language task the user wants done in a browser, we:
  1. Ask the LLM to pick a target URL + a short rationale.
  2. Drive a real headless browser to that URL.
  3. Stream back the navigation status, a PNG screenshot, extracted text.
  4. Ask the LLM for a final answer grounded in the extracted page content.

Each task runs in its own Playwright context — no shared browser state,
safe for Modal's stateless function model.
"""

from __future__ import annotations

import json
import logging
import urllib.parse
import uuid
from typing import AsyncGenerator

import httpx
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.agents.tools.real_browser import run_browser_task
from app.core.config import get_settings
from app.core.security import get_current_user
from app.models.common import ApiResponse, TenantContext

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/browser", tags=["browser"])


class ExecuteTaskRequest(BaseModel):
    task: str


PLAN_PROMPT = """You are a browser agent's planner. Given a user's natural-language task, pick the single best starting URL and explain briefly what you will look for.

Return ONLY valid JSON like:
{"url": "https://example.com/path", "wait_selector": "optional CSS selector or null", "goal": "1-sentence description"}

Rules:
- Always return a real, well-formed https URL.
- If the task mentions a specific site, use that site's homepage or the most relevant page.
- For general lookups, use a search engine URL such as https://duckduckgo.com/?q=YOUR+QUERY.
- wait_selector is optional; set to null if unknown.
"""


SUMMARIZE_PROMPT = """You are ATHENA's Browser Agent. A real headless browser just visited the user's target page and captured visible text. Answer the user's task using ONLY the captured text; cite the final URL. If the text does not answer the task, say so honestly."""


async def _plan_task(task: str) -> dict:
    """Ask the LLM to pick a starting URL + optional wait selector for the task."""
    settings = get_settings()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"{settings.euri_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.default_model,
                    "messages": [
                        {"role": "system", "content": PLAN_PROMPT},
                        {"role": "user", "content": f"Task: {task}"},
                    ],
                    "temperature": 0.2,
                    "max_tokens": 300,
                },
            )
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                content = content.strip().removeprefix("```json").removesuffix("```").strip()
                plan = json.loads(content)
                if isinstance(plan, dict) and plan.get("url", "").startswith("http"):
                    return plan
    except Exception as exc:
        logger.warning("Plan LLM failed: %s", str(exc)[:200])

    return {
        "url": f"https://duckduckgo.com/?q={urllib.parse.quote(task)}",
        "wait_selector": None,
        "goal": f"Search the web for: {task}",
    }


async def _summarize(task: str, page_text: str, final_url: str, title: str) -> str:
    settings = get_settings()
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.euri_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.default_model,
                    "messages": [
                        {"role": "system", "content": SUMMARIZE_PROMPT},
                        {
                            "role": "user",
                            "content": (
                                f"Task: {task}\n"
                                f"Page title: {title}\n"
                                f"Final URL: {final_url}\n"
                                f"Captured text:\n{page_text[:3500]}"
                            ),
                        },
                    ],
                    "temperature": 0.3,
                    "max_tokens": 400,
                },
            )
            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]
    except Exception as exc:
        logger.warning("Summarize LLM failed: %s", str(exc)[:200])

    return f"Visited {final_url} but could not synthesize a final answer."


def _sse(event: dict) -> str:
    return f"data: {json.dumps(event)}\n\n"


async def _stream_task(task: str) -> AsyncGenerator[str, None]:
    task_id = str(uuid.uuid4())
    yield _sse({"type": "start", "task_id": task_id})

    yield _sse({"type": "status", "message": "planning: picking best URL..."})
    plan = await _plan_task(task)
    yield _sse({"type": "plan", **plan})

    page_text = ""
    final_url = plan["url"]
    page_title = ""

    async for event in run_browser_task(plan["url"], task, plan.get("wait_selector")):
        yield _sse(event)
        if event.get("type") == "extract":
            page_text = event.get("content", "")
            final_url = event.get("final_url", plan["url"])
            page_title = event.get("title", "")

    yield _sse({"type": "status", "message": "synthesizing answer..."})
    answer = await _summarize(task, page_text, final_url, page_title)
    yield _sse({"type": "answer", "content": answer, "final_url": final_url})
    yield _sse({"type": "done", "task_id": task_id})


@router.post("/execute", response_model=ApiResponse[dict])
async def execute_task(
    body: ExecuteTaskRequest,
    ctx: TenantContext = Depends(get_current_user),
):
    """Submit a browser task — returns a task_id. The frontend should use /stream for SSE."""
    task_id = str(uuid.uuid4())
    return ApiResponse(
        success=True,
        data={
            "task_id": task_id,
            "task": body.task,
            "message": "Task queued. Connect to /stream with the same body for real-time events.",
        },
    )


@router.post("/stream")
async def stream_task(
    body: ExecuteTaskRequest,
    ctx: TenantContext = Depends(get_current_user),
):
    """Run a real browser task and stream progress as SSE."""
    return StreamingResponse(
        _stream_task(body.task),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
