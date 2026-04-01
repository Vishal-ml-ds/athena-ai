"""Weekly AI Report Service — generates personalized weekly insights.

Aggregates 7 days of habits/goals/finance/health data,
sends to LLM for analysis, returns AI-generated insights."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timedelta, timezone

import httpx
from supabase import Client

from app.core.config import get_settings

logger = logging.getLogger(__name__)

REPORT_DAYS = 7


async def generate_weekly_report(user_id: str, supabase: Client) -> dict:
    """Generate a personalized weekly report with AI insights.

    Returns:
        {
            "date_range": {"start": "...", "end": "..."},
            "habits": {...},
            "goals": {...},
            "finance": {...},
            "health": {...},
            "ai_insights": "...",
            "nudges": [...]
        }
    """
    settings = get_settings()
    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=REPORT_DAYS)
    since = week_ago.isoformat()

    report_data: dict = {
        "date_range": {
            "start": week_ago.strftime("%B %d, %Y"),
            "end": now.strftime("%B %d, %Y"),
        },
    }

    # Gather all data in parallel-ish (sequential but fast)
    report_data["habits"] = await _get_habits_data(user_id, supabase)
    report_data["goals"] = await _get_goals_data(user_id, supabase)
    report_data["finance"] = await _get_finance_data(user_id, supabase, since)
    report_data["health"] = await _get_health_data(user_id, supabase, since)

    # Generate AI insights from all the data
    report_data["ai_insights"] = await _generate_ai_insights(report_data, settings)
    report_data["nudges"] = _generate_nudges(report_data)

    # Store the report
    try:
        supabase.table("reports").insert({
            "user_id": user_id,
            "report_type": "weekly",
            "data": report_data,
            "period_start": week_ago.isoformat(),
            "period_end": now.isoformat(),
        }).execute()
    except Exception as exc:
        logger.warning("Failed to store report: %s", str(exc)[:200])

    return report_data


async def _get_habits_data(user_id: str, supabase: Client) -> list[dict]:
    """Get habits with streaks and completion rates."""
    try:
        result = (
            supabase.table("habits")
            .select("name, frequency, current_streak, best_streak, completion_rate")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .order("current_streak", desc=True)
            .limit(10)
            .execute()
        )
        return result.data or []
    except Exception:
        return []


async def _get_goals_data(user_id: str, supabase: Client) -> list[dict]:
    """Get active goals with progress."""
    try:
        result = (
            supabase.table("goals")
            .select("title, description, progress, target_date, status")
            .eq("user_id", user_id)
            .in_("status", ["active", "in_progress"])
            .order("progress", desc=True)
            .limit(10)
            .execute()
        )
        return result.data or []
    except Exception:
        return []


async def _get_finance_data(user_id: str, supabase: Client, since: str) -> dict:
    """Get finance summary for the period."""
    try:
        result = (
            supabase.table("finance_entries")
            .select("type, amount, category")
            .eq("user_id", user_id)
            .gte("created_at", since)
            .execute()
        )
        entries = result.data or []

        total_income = sum(e["amount"] for e in entries if e["type"] == "income")
        total_expenses = sum(e["amount"] for e in entries if e["type"] == "expense")

        categories: dict[str, float] = {}
        for e in entries:
            if e["type"] == "expense":
                cat = e.get("category", "Other")
                categories[cat] = categories.get(cat, 0) + e["amount"]

        sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]

        return {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "savings": total_income - total_expenses,
            "top_categories": [
                {"name": name, "percent": round(amount / total_expenses * 100) if total_expenses > 0 else 0}
                for name, amount in sorted_cats
            ],
        }
    except Exception:
        return {"total_income": 0, "total_expenses": 0, "savings": 0, "top_categories": []}


async def _get_health_data(user_id: str, supabase: Client, since: str) -> dict:
    """Get health trends for the period."""
    try:
        result = (
            supabase.table("health_logs")
            .select("metric_type, value, created_at")
            .eq("user_id", user_id)
            .gte("created_at", since)
            .order("created_at")
            .limit(100)
            .execute()
        )
        logs = result.data or []

        metrics: dict[str, list[float]] = {}
        for log in logs:
            metric = log.get("metric_type", "unknown")
            if metric not in metrics:
                metrics[metric] = []
            metrics[metric].append(float(log.get("value", 0)))

        health_summary = {}
        for metric, values in metrics.items():
            avg = sum(values) / len(values) if values else 0
            health_summary[metric] = {
                "average": round(avg, 1),
                "entries": len(values),
                "trend": "up" if len(values) >= 2 and values[-1] > values[0] else "down",
            }

        return health_summary
    except Exception:
        return {}


async def _generate_ai_insights(report_data: dict, settings) -> str:
    """Use LLM to generate personalized weekly insights from the data."""
    data_summary = json.dumps(report_data, default=str, indent=2)[:3000]

    prompt = f"""You are ATHENA, a personal AI assistant. Generate a brief, encouraging weekly report summary for the user based on their data.

Data:
{data_summary}

Write 3-5 bullet points of personalized insights. Be specific — reference actual numbers.
Keep it concise, motivating, and actionable. Use markdown formatting."""

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
                        {"role": "system", "content": "Generate concise weekly report insights. Be specific and actionable."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.5,
                    "max_tokens": 500,
                },
            )

            if response.status_code == 200:
                return response.json()["choices"][0]["message"]["content"]

    except Exception as exc:
        logger.warning("AI insights generation failed: %s", str(exc)[:200])

    return "Weekly insights could not be generated. Check back later."


def _generate_nudges(report_data: dict) -> list[dict]:
    """Generate actionable nudges based on the data — no LLM needed."""
    nudges: list[dict] = []

    # Habit nudges
    habits = report_data.get("habits", [])
    for habit in habits:
        rate = habit.get("completion_rate", 100)
        if rate < 50:
            nudges.append({
                "text": f"'{habit['name']}' needs attention — only {rate}% this week",
                "priority": "high",
                "category": "habits",
            })

    # Goal nudges
    goals = report_data.get("goals", [])
    for goal in goals:
        progress = goal.get("progress", 0)
        if progress < 25:
            nudges.append({
                "text": f"'{goal['title']}' is at {progress}% — break it into smaller steps",
                "priority": "medium",
                "category": "goals",
            })

    # Finance nudges
    finance = report_data.get("finance", {})
    savings = finance.get("savings", 0)
    if savings < 0:
        nudges.append({
            "text": f"You overspent by Rs {abs(savings):,.0f} this week — review your budget",
            "priority": "high",
            "category": "finance",
        })

    if not nudges:
        nudges.append({
            "text": "Great week! Keep up the momentum.",
            "priority": "low",
            "category": "general",
        })

    return nudges
