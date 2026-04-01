"""Tests for the analytics router — fixed query, days filter, agent distribution."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.routers.analytics import router
from tests.conftest import *  # noqa: F401, F403


@pytest.fixture
def client(mock_supabase, mock_tenant_context):
    from fastapi import FastAPI
    from app.core.dependencies import get_supabase_client
    from app.core.security import get_current_user

    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    app.dependency_overrides[get_current_user] = lambda: mock_tenant_context

    return TestClient(app)


class TestGetUsage:
    def test_returns_correct_shape(self, client, mock_supabase):
        """Should return conversations, messages, tokens_used, plan, days."""
        mock_supabase.execute.return_value = MagicMock(data=[], count=3)

        response = client.get("/api/v1/analytics/usage")
        assert response.status_code == 200
        data = response.json()["data"]
        assert "conversations" in data
        assert "messages" in data
        assert "tokens_used" in data
        assert "plan" in data
        assert "days" in data

    def test_days_param_default_30(self, client, mock_supabase):
        """Default days should be 30."""
        mock_supabase.execute.return_value = MagicMock(data=[], count=0)
        response = client.get("/api/v1/analytics/usage")
        assert response.json()["data"]["days"] == 30

    def test_days_param_custom(self, client, mock_supabase):
        """Should accept days=7."""
        mock_supabase.execute.return_value = MagicMock(data=[], count=0)
        response = client.get("/api/v1/analytics/usage?days=7")
        assert response.json()["data"]["days"] == 7

    def test_days_param_invalid_rejected(self, client):
        """Days below 7 should be rejected."""
        response = client.get("/api/v1/analytics/usage?days=1")
        assert response.status_code == 422

    def test_no_literal_string_in_query(self, client, mock_supabase):
        """Old bug: .eq('conversation_id', 'conversation_id') — the literal string.
        Verify we no longer pass a literal string as the conversation_id filter."""
        mock_supabase.execute.return_value = MagicMock(data=[], count=0)
        client.get("/api/v1/analytics/usage")

        # Collect all calls to .eq() and assert none use the string "conversation_id"
        # as both field AND value (the old bug)
        eq_calls = mock_supabase.eq.call_args_list
        for call in eq_calls:
            args = call.args
            if len(args) >= 2:
                assert not (args[0] == "conversation_id" and args[1] == "conversation_id"), \
                    "Bug regression: literal 'conversation_id' string passed as value"


class TestAgentDistribution:
    def test_returns_list(self, client, mock_supabase):
        """Should return a list of agent/count pairs."""
        # First execute: conversations (needs 'id' field)
        # Second execute: messages (needs 'agent_name' field)
        mock_supabase.execute.side_effect = [
            MagicMock(data=[{"id": "conv-1"}, {"id": "conv-2"}], count=2),
            MagicMock(data=[
                {"agent_name": "researcher"},
                {"agent_name": "researcher"},
                {"agent_name": "coder"},
            ], count=0),
        ]

        response = client.get("/api/v1/analytics/agent-distribution")
        assert response.status_code == 200
        assert isinstance(response.json()["data"], list)

    def test_empty_when_no_conversations(self, client, mock_supabase):
        """Should return empty list when user has no conversations."""
        # First call (conversations) returns empty
        mock_supabase.execute.return_value = MagicMock(data=[], count=0)
        response = client.get("/api/v1/analytics/agent-distribution")
        assert response.status_code == 200
        assert response.json()["data"] == []
