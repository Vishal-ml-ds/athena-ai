"""Web search tool — gives the Researcher agent real internet access.

Uses Tavily API (1000 searches/month free) to search the web
and return structured results the agent can synthesize."""

from __future__ import annotations

import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

MAX_RESULTS = 5
SEARCH_TIMEOUT_SECONDS = 15


async def search_web(query: str, max_results: int = MAX_RESULTS) -> dict:
    """Search the web using Tavily API.

    Returns:
        {
            "results": [{"title": "...", "url": "...", "content": "..."}],
            "query": "original query",
            "error": None | "error message"
        }
    """
    settings = get_settings()
    tavily_key = getattr(settings, "tavily_api_key", None)

    if not tavily_key:
        return {
            "results": [],
            "query": query,
            "error": "Tavily API key not configured. Add TAVILY_API_KEY to .env",
        }

    try:
        async with httpx.AsyncClient(timeout=SEARCH_TIMEOUT_SECONDS) as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": tavily_key,
                    "query": query,
                    "max_results": max_results,
                    "include_answer": True,
                    "search_depth": "basic",
                },
            )

            if response.status_code != 200:
                return {
                    "results": [],
                    "query": query,
                    "error": f"Tavily returned status {response.status_code}",
                }

            data = response.json()
            results = [
                {
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": r.get("content", "")[:500],
                }
                for r in data.get("results", [])[:max_results]
            ]

            return {
                "results": results,
                "query": query,
                "answer": data.get("answer"),
                "error": None,
            }

    except httpx.TimeoutException:
        return {"results": [], "query": query, "error": "Search timed out"}
    except Exception as exc:
        logger.warning("Web search failed: %s", str(exc)[:200])
        return {"results": [], "query": query, "error": str(exc)[:200]}


def format_search_results(search_data: dict) -> str:
    """Format search results into a string the agent can use in its prompt."""
    if search_data.get("error"):
        return f"[Web search failed: {search_data['error']}]"

    results = search_data.get("results", [])
    if not results:
        return "[No web results found for this query]"

    lines = [f"Web search results for: \"{search_data['query']}\"\n"]

    answer = search_data.get("answer")
    if answer:
        lines.append(f"Quick answer: {answer}\n")

    for i, r in enumerate(results, 1):
        lines.append(f"{i}. **{r['title']}**")
        lines.append(f"   URL: {r['url']}")
        lines.append(f"   {r['content']}\n")

    return "\n".join(lines)
