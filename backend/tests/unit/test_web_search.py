"""Tests for the web search tool."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.agents.tools.web_search import format_search_results, search_web


class TestSearchWeb:
    """Tests for the Tavily web search integration."""

    @pytest.mark.asyncio
    async def test_returns_error_when_no_api_key(self):
        """Should return a clear error when TAVILY_API_KEY is empty."""
        mock_settings = MagicMock()
        mock_settings.tavily_api_key = ""

        with patch("app.agents.tools.web_search.get_settings", return_value=mock_settings):
            result = await search_web("test query")

        assert result["error"] is not None
        assert "not configured" in result["error"]
        assert result["results"] == []

    @pytest.mark.asyncio
    async def test_returns_results_on_success(self):
        """Should return formatted results from Tavily."""
        mock_settings = MagicMock()
        mock_settings.tavily_api_key = "tvly-test-key"

        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "answer": "Quick answer here",
            "results": [
                {"title": "Result 1", "url": "https://example.com", "content": "Some content"},
                {"title": "Result 2", "url": "https://test.com", "content": "More content"},
            ],
        }

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.post = AsyncMock(return_value=mock_response)

        with (
            patch("app.agents.tools.web_search.get_settings", return_value=mock_settings),
            patch("app.agents.tools.web_search.httpx.AsyncClient", return_value=mock_client),
        ):
            result = await search_web("test query")

        assert result["error"] is None
        assert len(result["results"]) == 2
        assert result["results"][0]["title"] == "Result 1"
        assert result["answer"] == "Quick answer here"

    @pytest.mark.asyncio
    async def test_handles_api_error_gracefully(self):
        """Should not crash on API errors."""
        mock_settings = MagicMock()
        mock_settings.tavily_api_key = "tvly-test-key"

        mock_response = MagicMock()
        mock_response.status_code = 500

        mock_client = AsyncMock()
        mock_client.__aenter__ = AsyncMock(return_value=mock_client)
        mock_client.__aexit__ = AsyncMock(return_value=False)
        mock_client.post = AsyncMock(return_value=mock_response)

        with (
            patch("app.agents.tools.web_search.get_settings", return_value=mock_settings),
            patch("app.agents.tools.web_search.httpx.AsyncClient", return_value=mock_client),
        ):
            result = await search_web("test query")

        assert result["error"] is not None
        assert result["results"] == []


class TestFormatSearchResults:
    """Tests for formatting search results into prompt text."""

    def test_formats_results_with_titles_and_urls(self):
        """Should produce readable text with numbered results."""
        data = {
            "query": "python fastapi",
            "results": [
                {"title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com", "content": "FastAPI is a modern web framework"},
            ],
            "answer": None,
            "error": None,
        }

        formatted = format_search_results(data)
        assert "FastAPI Docs" in formatted
        assert "fastapi.tiangolo.com" in formatted
        assert "python fastapi" in formatted

    def test_shows_error_message_on_failure(self):
        """Should show a clear error when search failed."""
        data = {"error": "API key invalid", "results": [], "query": "test"}

        formatted = format_search_results(data)
        assert "failed" in formatted.lower()
        assert "API key invalid" in formatted

    def test_handles_no_results(self):
        """Should show a message when no results found."""
        data = {"error": None, "results": [], "query": "test"}

        formatted = format_search_results(data)
        assert "No web results" in formatted
