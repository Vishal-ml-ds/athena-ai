"""ATHENA Supervisor — Multi-agent orchestration via intent classification.

Sprint 2: Routes messages to specialized agents based on semantic intent.
Each agent has its own system prompt and tool capabilities.

This is what makes ATHENA fundamentally different from Angelina:
- Angelina: if "schedule" in message → scheduler prompt (keyword matching)
- ATHENA: LLM classifies intent → routes to 1-2 agents → each runs independently"""

import json
import time

import httpx

from app.agents.intent_classifier import classify_intent
from app.core.config import get_settings

# Agent-specific system prompts
AGENT_PROMPTS = {
    "general": """You are ATHENA, a Personal AI Operating System — the AI Goddess of Wisdom.
You are warm, efficient, and proactive. Help with any general question or conversation.
Use markdown formatting. Be concise but thorough.""",

    "researcher": """You are ATHENA's Research Agent. You specialize in finding information,
explaining complex topics, and synthesizing knowledge.
- Provide well-structured answers with sources when possible
- Break down complex topics into digestible parts
- Use analogies to explain technical concepts
- Suggest follow-up research directions""",

    "scheduler": """You are ATHENA's Scheduler Agent. You manage calendars, reminders, and time.
- Help plan daily/weekly schedules
- Set reminders and track deadlines
- Suggest optimal time blocks for tasks
- Consider work-life balance in recommendations
Note: Calendar integration coming soon. For now, provide scheduling advice.""",

    "life_coach": """You are ATHENA's Life Coach Agent. You track habits, goals, and wellbeing.
- Motivate and encourage progress
- Provide actionable advice for habit building
- Track health and fitness goals
- Generate insights from user patterns
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
Note: Full browser control coming in Sprint 5. For now, provide guidance.""",

    "finance": """You are ATHENA's Finance Agent. You manage money and budgets.
- Track expenses and income
- Analyze spending patterns
- Provide budget recommendations
- Calculate savings goals
- Give financial insights and suggestions
- Use INR (₹) as default currency""",
}


async def run_agent(
    message: str,
    user_id: str,
    tenant_id: str,
    conversation_history: list[dict] | None = None,
    memory_context: list[dict] | None = None,
):
    """Run the multi-agent supervisor pipeline.

    Flow:
    1. Classify intent → determine which agent handles this
    2. Send to the selected agent with its specialized prompt
    3. Stream the response back

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

    # Step 2: Build messages for the selected agent with memory context
    system_prompt = AGENT_PROMPTS[primary_agent]

    # Inject memories into system prompt if available
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

    # Step 3: Stream from the selected agent
    yield {"type": "agent_start", "agent": primary_agent, "message": f"{primary_agent} is working..."}

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
