"""Life OS tools — gives agents real access to user's habits, goals, finance, and health data.

These tools allow the Life Coach and Finance agents to query actual user data
instead of just giving generic advice."""

from __future__ import annotations

import logging
from datetime import datetime, timedelta

from supabase import Client

logger = logging.getLogger(__name__)


async def get_habits_summary(user_id: str, supabase: Client) -> str:
    """Get a summary of user's habits with streaks and completion rates."""
    try:
        result = (
            supabase.table("habits")
            .select("name, frequency, current_streak, best_streak, completion_rate, is_active")
            .eq("user_id", user_id)
            .eq("is_active", True)
            .order("current_streak", desc=True)
            .limit(20)
            .execute()
        )
        habits = result.data or []
        if not habits:
            return "No active habits tracked yet."

        lines = ["User's Active Habits:"]
        for h in habits:
            lines.append(
                f"- {h['name']} ({h['frequency']}): "
                f"{h['current_streak']} day streak, "
                f"{h.get('completion_rate', 0)}% completion rate, "
                f"best streak: {h.get('best_streak', 0)} days"
            )
        return "\n".join(lines)
    except Exception as exc:
        logger.warning("Failed to fetch habits: %s", str(exc)[:200])
        return "Could not fetch habit data."


async def get_goals_summary(user_id: str, supabase: Client) -> str:
    """Get active goals with progress percentages."""
    try:
        result = (
            supabase.table("goals")
            .select("title, description, progress, target_date, status")
            .eq("user_id", user_id)
            .in_("status", ["active", "in_progress"])
            .order("target_date")
            .limit(20)
            .execute()
        )
        goals = result.data or []
        if not goals:
            return "No active goals set."

        lines = ["User's Active Goals:"]
        for g in goals:
            target = g.get("target_date", "no deadline")
            lines.append(
                f"- {g['title']}: {g.get('progress', 0)}% complete "
                f"(deadline: {target})"
            )
            if g.get("description"):
                lines.append(f"  Description: {g['description'][:100]}")
        return "\n".join(lines)
    except Exception as exc:
        logger.warning("Failed to fetch goals: %s", str(exc)[:200])
        return "Could not fetch goal data."


async def get_finance_summary(user_id: str, supabase: Client, days: int = 30) -> str:
    """Get finance summary — income, expenses, top categories."""
    try:
        since = (datetime.utcnow() - timedelta(days=days)).isoformat()

        result = (
            supabase.table("finance_entries")
            .select("type, amount, category, description, created_at")
            .eq("user_id", user_id)
            .gte("created_at", since)
            .order("created_at", desc=True)
            .limit(100)
            .execute()
        )
        entries = result.data or []
        if not entries:
            return f"No finance entries in the last {days} days."

        total_income = sum(e["amount"] for e in entries if e["type"] == "income")
        total_expenses = sum(e["amount"] for e in entries if e["type"] == "expense")
        savings = total_income - total_expenses

        # Top expense categories
        categories: dict[str, float] = {}
        for e in entries:
            if e["type"] == "expense":
                cat = e.get("category", "Uncategorized")
                categories[cat] = categories.get(cat, 0) + e["amount"]

        sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]

        lines = [
            f"Finance Summary (last {days} days):",
            f"- Total Income: Rs {total_income:,.0f}",
            f"- Total Expenses: Rs {total_expenses:,.0f}",
            f"- Net Savings: Rs {savings:,.0f}",
        ]

        if sorted_cats:
            lines.append("Top expense categories:")
            for cat, amount in sorted_cats:
                lines.append(f"  - {cat}: Rs {amount:,.0f}")

        return "\n".join(lines)
    except Exception as exc:
        logger.warning("Failed to fetch finance data: %s", str(exc)[:200])
        return "Could not fetch finance data."


async def get_health_summary(user_id: str, supabase: Client, days: int = 7) -> str:
    """Get health data summary — sleep, exercise, weight."""
    try:
        since = (datetime.utcnow() - timedelta(days=days)).isoformat()

        result = (
            supabase.table("health_logs")
            .select("metric_type, value, unit, created_at")
            .eq("user_id", user_id)
            .gte("created_at", since)
            .order("created_at", desc=True)
            .limit(50)
            .execute()
        )
        logs = result.data or []
        if not logs:
            return f"No health logs in the last {days} days."

        # Group by metric type
        metrics: dict[str, list[float]] = {}
        for log in logs:
            metric = log.get("metric_type", "unknown")
            value = log.get("value", 0)
            if metric not in metrics:
                metrics[metric] = []
            metrics[metric].append(float(value))

        lines = [f"Health Summary (last {days} days):"]
        for metric, values in metrics.items():
            avg = sum(values) / len(values)
            lines.append(f"- {metric}: avg {avg:.1f} ({len(values)} entries)")

        return "\n".join(lines)
    except Exception as exc:
        logger.warning("Failed to fetch health data: %s", str(exc)[:200])
        return "Could not fetch health data."
