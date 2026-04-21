"""Tests for the weekly report service."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.report_service import _generate_nudges, generate_weekly_report


class TestGenerateNudges:
    """Tests for the rule-based nudge generator."""

    def test_low_habit_completion_creates_nudge(self):
        """Should flag habits below 50% completion."""
        data = {
            "habits": [{"name": "Meditation", "completion_rate": 20}],
            "goals": [],
            "finance": {},
        }

        nudges = _generate_nudges(data)
        assert len(nudges) >= 1
        assert "Meditation" in nudges[0]["text"]
        assert nudges[0]["priority"] == "high"

    def test_low_goal_progress_creates_nudge(self):
        """Should flag goals below 25% progress."""
        data = {
            "habits": [],
            "goals": [{"title": "Learn Python", "progress": 10}],
            "finance": {},
        }

        nudges = _generate_nudges(data)
        assert any("Learn Python" in n["text"] for n in nudges)

    def test_overspending_creates_finance_nudge(self):
        """Should flag when savings are negative."""
        data = {
            "habits": [],
            "goals": [],
            "finance": {"savings": -5000},
        }

        nudges = _generate_nudges(data)
        assert any("overspent" in n["text"].lower() for n in nudges)

    def test_good_week_returns_positive_nudge(self):
        """Should return encouragement when everything is on track."""
        data = {
            "habits": [{"name": "Exercise", "completion_rate": 80}],
            "goals": [{"title": "Ship ATHENA", "progress": 60}],
            "finance": {"savings": 10000},
        }

        nudges = _generate_nudges(data)
        assert any("great" in n["text"].lower() or "momentum" in n["text"].lower() for n in nudges)

    def test_empty_data_returns_positive_nudge(self):
        """Should handle empty data gracefully."""
        data = {"habits": [], "goals": [], "finance": {}}

        nudges = _generate_nudges(data)
        assert len(nudges) >= 1


class TestGenerateWeeklyReport:
    """Tests for the full report generation pipeline."""

    @pytest.mark.asyncio
    async def test_report_includes_all_sections(self):
        """Should return a report with all expected keys."""
        mock_supabase = MagicMock()

        # Mock all table queries to return empty data
        mock_execute = MagicMock()
        mock_execute.data = []

        mock_chain = MagicMock()
        mock_chain.select.return_value = mock_chain
        mock_chain.eq.return_value = mock_chain
        mock_chain.in_.return_value = mock_chain
        mock_chain.gte.return_value = mock_chain
        mock_chain.order.return_value = mock_chain
        mock_chain.limit.return_value = mock_chain
        mock_chain.execute.return_value = mock_execute
        mock_chain.insert.return_value = mock_chain

        mock_supabase.table.return_value = mock_chain

        # Mock the AI insights call
        with patch("app.services.report_service._generate_ai_insights", new_callable=AsyncMock) as mock_ai:
            mock_ai.return_value = "Great week!"
            report = await generate_weekly_report("user-123", mock_supabase)

        assert "date_range" in report
        assert "habits" in report
        assert "goals" in report
        assert "finance" in report
        assert "health" in report
        assert "ai_insights" in report
        assert "nudges" in report
