"""Semantic intent classifier — routes user messages to the right agent.

Unlike Angelina's keyword matching, this uses embedding similarity
to classify intent. Much more accurate for ambiguous queries."""

import json

import httpx

from app.core.config import get_settings

# Intent examples for each agent — used for classification
AGENT_INTENTS = {
    "researcher": [
        "find information about",
        "research this topic",
        "what does this mean",
        "search for",
        "look up",
        "summarize this article",
        "what are the latest trends in",
        "compare these options",
        "explain how this works",
        "give me facts about",
    ],
    "scheduler": [
        "schedule a meeting",
        "remind me to",
        "what's on my calendar",
        "book an appointment",
        "set an alarm for",
        "plan my day",
        "when is my next meeting",
        "block time for",
        "reschedule",
        "cancel my appointment",
    ],
    "life_coach": [
        "track my habits",
        "how are my goals",
        "log my exercise",
        "weekly report",
        "how much did I spend",
        "update my weight",
        "how is my health",
        "motivate me",
        "what should I focus on",
        "review my progress",
    ],
    "coder": [
        "write code for",
        "fix this bug",
        "explain this code",
        "review my code",
        "create a function that",
        "debug this error",
        "how do I implement",
        "refactor this",
        "write a test for",
        "what does this error mean",
    ],
    "browser": [
        "log into this website for me",
        "fill out this form on the site",
        "book a flight on expedia",
        "add this to my cart and check out",
        "click through these pages",
        "scrape data from this specific page",
        "automate this web task",
        "navigate to the dashboard and click export",
        "sign up on this site for me",
        "download every file from this page",
    ],
    "finance": [
        "track my expenses",
        "how much did I spend",
        "budget analysis",
        "add an expense",
        "income this month",
        "savings goal",
        "categorize my spending",
        "financial summary",
        "investment advice",
        "am I over budget",
    ],
}

# Flatten for general fallback
GENERAL_THRESHOLD = 0.3


async def classify_intent(message: str) -> dict:
    """Classify a user message to determine which agent(s) should handle it.

    Returns:
        {
            "primary_agent": "researcher",
            "confidence": 0.85,
            "secondary_agent": "scheduler" | None,
            "reasoning": "User wants to find information"
        }

    Uses the LLM itself for classification — more accurate than embeddings
    for a small number of categories, and zero extra cost on free tier."""

    settings = get_settings()

    agent_list = ", ".join(AGENT_INTENTS.keys())
    classification_prompt = f"""Classify this user message into the best agent to handle it.

Available agents: {agent_list}, general

Agent descriptions:
- researcher: find information, web search, news, latest trends, current facts, compare options, explain topics, summarize, "what is", "who is", "look up", anything that needs up-to-date info from the internet
- scheduler: calendar, reminders, meetings, time management
- life_coach: habits, goals, health, motivation, weekly reports, progress tracking
- coder: writing code, debugging, code review, technical implementation
- browser: actions that REQUIRE controlling a real browser on the user's behalf — logging in, filling forms, clicking through pages, checking out carts, scraping a specific page. If the user just wants information FROM the web, use researcher instead.
- finance: expenses, budgets, income, savings, financial analysis
- general: casual conversation, greetings, questions about ATHENA itself

Key rule: "search the web", "find news", "look up X", "what are the latest X", "top headlines", "compare prices" → researcher (not browser).

User message: "{message}"

Respond in JSON only:
{{"primary_agent": "agent_name", "confidence": 0.0-1.0, "secondary_agent": null_or_"agent_name", "reasoning": "brief reason"}}"""

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                f"{settings.euri_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.euri_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": "You are a message classifier. Respond only in valid JSON."},
                        {"role": "user", "content": classification_prompt},
                    ],
                    "temperature": 0.1,
                    "max_tokens": 150,
                },
            )

            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                # Strip markdown code fences if present
                content = content.strip().removeprefix("```json").removesuffix("```").strip()
                result = json.loads(content)
                return result

    except Exception:
        pass

    # Fallback: general agent
    return {
        "primary_agent": "general",
        "confidence": 0.5,
        "secondary_agent": None,
        "reasoning": "Classification failed, using general agent",
    }
