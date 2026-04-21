"""ATHENA Supervisor — Multi-agent orchestration with real tool access.

Routes messages to specialized agents based on semantic intent.
Each agent has its own system prompt AND real tools:
- Researcher: Tavily web search
- Life Coach: habits, goals, health data queries
- Finance: expense/income data queries

This is what makes ATHENA fundamentally different from Angelina:
- Angelina: if "schedule" in message → scheduler prompt (keyword matching)
- ATHENA: LLM classifies intent → routes to agent → agent uses real tools → streams response"""

from __future__ import annotations

import json
import logging
import time

import httpx
from supabase import Client

from app.agents.intent_classifier import classify_intent
from app.agents.tools.life_tools import (
    get_finance_summary,
    get_goals_summary,
    get_habits_summary,
    get_health_summary,
)
from app.agents.tools.web_search import format_search_results, search_web
from app.core.config import get_settings

logger = logging.getLogger(__name__)

# Agent-specific system prompts
AGENT_PROMPTS = {
    "general": """You are ATHENA, a Personal AI Operating System — the AI Goddess of Wisdom.
You are warm, efficient, and proactive. Help with any general question or conversation.
Use markdown formatting. Be concise but thorough.""",

    "researcher": """You are ATHENA's Research Agent. You specialize in finding information,
explaining complex topics, and synthesizing knowledge.
- You have ACCESS TO WEB SEARCH — use the search results provided below
- Cite sources with URLs when answering from web results
- Provide well-structured answers with clear sections
- Break down complex topics into digestible parts
- Suggest follow-up research directions""",

    "scheduler": """You are ATHENA's Scheduler Agent. You manage calendars, reminders, and time.
- Help plan daily/weekly schedules
- Set reminders and track deadlines
- Suggest optimal time blocks for tasks
- Consider work-life balance in recommendations
Note: Calendar integration coming soon. For now, provide scheduling advice.""",

    "life_coach": """You are ATHENA's Life Coach Agent. You track habits, goals, and wellbeing.
- You have ACCESS TO THE USER'S REAL DATA — habits, goals, health logs
- Reference their actual data when giving advice
- Motivate and encourage progress based on their real numbers
- Provide actionable advice for habit building
- Be supportive but honest about areas for improvement""",

    "coder": """You are ATHENA's Coding Agent. You write, debug, and explain code.
- Write clean, production-quality code
- Explain code simply with comments
- Debug errors with clear step-by-step fixes
- Suggest best practices and patterns
- Support Python, JavaScript/TypeScript, SQL, and more""",

    "browser": """You are ATHENA's Browser Agent. You help with web tasks.
- Guide users through web-based tasks
- Help compare products and prices
- Assist with online research and data gathering
- Suggest optimal approaches for web automation
Note: Full browser control coming soon. For now, provide guidance.""",

    "finance": """You are ATHENA's Finance Agent. You manage money and budgets.
- You have ACCESS TO THE USER'S REAL FINANCE DATA
- Reference their actual spending, income, and savings
- Analyze spending patterns from real data
- Provide personalized budget recommendations
- Use INR (Rs) as default currency""",
}


async def _gather_tool_context(
    agent_name: str,
    message: str,
    user_id: str,
    supabase: Client | None,
) -> str:
    """Run agent-specific tools and return context to inject into the prompt.

    This is the key innovation: agents get real data before generating a response."""

    context_parts: list[str] = []

    if agent_name == "researcher":
        search_data = await search_web(message)
        formatted = format_search_results(search_data)
        context_parts.append(formatted)

    elif agent_name == "life_coach" and supabase:
        habits = await get_habits_summary(user_id, supabase)
        goals = await get_goals_summary(user_id, supabase)
        health = await get_health_summary(user_id, supabase)
        context_parts.extend([habits, goals, health])

    elif agent_name == "finance" and supabase:
        finance = await get_finance_summary(user_id, supabase)
        context_parts.append(finance)

    if not context_parts:
        return ""

    return "\n\n---\nREAL USER DATA (use this to personalize your response):\n" + "\n\n".join(context_parts)


async def run_agent(
    message: str,
    user_id: str,
    tenant_id: str,
    conversation_history: list[dict] | None = None,
    memory_context: list[dict] | None = None,
    supabase: Client | None = None,
):
    """Run the multi-agent supervisor pipeline.

    Flow:
    1. Classify intent → determine which agent handles this
    2. Run agent-specific tools (web search, data queries)
    3. Send to the selected agent with its specialized prompt + tool context
    4. Stream the response back

    Yields SSE events for the frontend."""

    settings = get_settings()

    # Step 1: Classify intent
    yield {"type": "agent_start", "agent": "supervisor", "message": "Analyzing your request..."}

    classification = await classify_intent(message)
    primary_agent = classification.get("primary_agent", "general")
    confidence = classification.get("confidence", 0.5)
    secondary_agent = classification.get("secondary_agent")
    reasoning = classification.get("reasoning", "")

    # Validate agent name
    if primary_agent not in AGENT_PROMPTS:
        primary_agent = "general"

    yield {
        "type": "classification",
        "primary_agent": primary_agent,
        "confidence": confidence,
        "secondary_agent": secondary_agent,
        "reasoning": reasoning,
    }

    # Step 2: Run agent-specific tools
    yield {"type": "agent_start", "agent": primary_agent, "message": f"{primary_agent} is gathering data..."}

    tool_context = await _gather_tool_context(primary_agent, message, user_id, supabase)

    if tool_context:
        yield {"type": "tool_result", "agent": primary_agent, "message": "Data gathered, generating response..."}

    # Step 3: Build messages for the selected agent
    system_prompt = AGENT_PROMPTS[primary_agent]

    # Inject tool context into system prompt
    if tool_context:
        system_prompt += f"\n\n{tool_context}"

    # Inject memories into system prompt
    if memory_context:
        memory_texts = "\n".join(
            f"- {m.get('content', '')}" for m in memory_context[:5]
        )
        system_prompt += f"\n\nRelevant memories about this user:\n{memory_texts}\nUse these memories to personalize your response when relevant."

    messages = [{"role": "system", "content": system_prompt}]

    if conversation_history:
        for msg in conversation_history[-20:]:
            if msg["role"] in ("user", "assistant"):
                messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": message})

    # Step 4: Stream from the selected agent
    yield {"type": "agent_start", "agent": primary_agent, "message": f"{primary_agent} is responding..."}

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
        "agent": primary_agent,
        "tokens": estimated_tokens,
        "latency_ms": latency_ms,
    }

    yield {
        "type": "done",
        "full_content": full_content,
        "agent_name": primary_agent,
        "model": settings.default_model,
        "tokens_used": estimated_tokens,
        "latency_ms": latency_ms,
    }
