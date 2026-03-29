"""ATHENA Agent Supervisor — uses Euri AI (OpenAI-compatible) via raw HTTP.

No langchain-openai dependency needed — just httpx which is already installed.
Sprint 1: Single general agent. Sprint 2: Multi-agent with LangGraph."""

import json
import time

import httpx

from app.core.config import get_settings

ATHENA_SYSTEM_PROMPT = """You are ATHENA, a Personal AI Operating System — the AI Goddess of Wisdom.

You are intelligent, proactive, and always helpful. You manage the user's entire digital life:
scheduling, research, coding, finances, health, and goals.

Key traits:
- You are warm but efficient — no unnecessary filler
- You remember context from previous conversations (when memory is available)
- You explain complex topics simply, using analogies when helpful
- You are proactive — suggest next steps, anticipate needs
- You are honest about what you can and cannot do

When responding:
- Be concise but thorough
- Use markdown formatting for readability
- If a task requires multiple steps, break it down clearly
- If you need more information, ask specific questions"""


async def run_agent(
    message: str,
    user_id: str,
    tenant_id: str,
    conversation_history: list[dict] | None = None,
):
    """Run the agent via Euri AI and yield streaming response chunks.

    Uses raw httpx to call the OpenAI-compatible chat completions endpoint.
    No extra LLM packages needed — just HTTP."""

    settings = get_settings()

    # Build messages array
    messages = [{"role": "system", "content": ATHENA_SYSTEM_PROMPT}]

    if conversation_history:
        for msg in conversation_history[-20:]:  # Last 20 for context window
            if msg["role"] in ("user", "assistant"):
                messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": message})

    yield {"type": "agent_start", "agent": "general", "message": "Thinking..."}

    start_time = time.time()
    full_content = ""

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            async with client.stream(
                "POST",
                f"{settings.euri_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.default_model,
                    "messages": messages,
                    "stream": True,
                    "temperature": 0.7,
                    "max_tokens": 2000,
                },
            ) as response:
                if response.status_code != 200:
                    error_body = await response.aread()
                    error_msg = f"AI service returned {response.status_code}"
                    try:
                        error_data = json.loads(error_body)
                        error_msg = error_data.get("error", {}).get("message", error_msg)
                    except Exception:
                        pass
                    full_content = f"Sorry, I hit an issue: {error_msg}"
                    yield {"type": "token", "content": full_content}
                else:
                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data = line[6:]
                        if data == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk["choices"][0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                full_content += content
                                yield {"type": "token", "content": content}
                        except (json.JSONDecodeError, KeyError, IndexError):
                            continue

    except httpx.TimeoutException:
        full_content = "Sorry, the AI took too long to respond. Please try again."
        yield {"type": "token", "content": full_content}
    except Exception as e:
        full_content = f"Sorry, something went wrong: {str(e)[:150]}"
        yield {"type": "token", "content": full_content}

    latency_ms = int((time.time() - start_time) * 1000)
    estimated_tokens = len(full_content) // 4

    yield {
        "type": "agent_end",
        "agent": "general",
        "tokens": estimated_tokens,
        "latency_ms": latency_ms,
    }

    yield {
        "type": "done",
        "full_content": full_content,
        "agent_name": "general",
        "model": settings.default_model,
        "tokens_used": estimated_tokens,
        "latency_ms": latency_ms,
    }
