"""Tests for life router — Pydantic validation on all endpoints."""

from __future__ import annotations

from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from tests.conftest import *  # noqa: F401, F403


@pytest.fixture
def client(mock_supabase, mock_tenant_context):
    from fastapi import FastAPI
    from app.core.dependencies import get_supabase_client
    from app.core.security import get_current_user
    from app.routers.life import router

    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    app.dependency_overrides[get_current_user] = lambda: mock_tenant_context

    return TestClient(app)


class TestCreateHabit:
    def test_valid_habit_creates_successfully(self, client, mock_supabase):
        mock_supabase.execute.return_value = MagicMock(data=[{"id": "h1", "name": "Run"}])
        response = client.post("/api/v1/life/habits", json={"name": "Morning Run"})
        assert response.status_code == 201
        assert response.json()["success"] is True

    def test_missing_name_returns_422(self, client):
        """Name is required — empty body should fail validation."""
        response = client.post("/api/v1/life/habits", json={})
        assert response.status_code == 422

    def test_empty_name_returns_422(self, client):
        """Name min_length=1 — empty string should fail."""
        response = client.post("/api/v1/life/habits", json={"name": ""})
        assert response.status_code == 422

    def test_name_too_long_returns_422(self, client):
        """Name max_length=100."""
        response = client.post("/api/v1/life/habits", json={"name": "x" * 101})
        assert response.status_code == 422

    def test_optional_fields_have_defaults(self, client, mock_supabase):
        """Category and description should default without being provided."""
        mock_supabase.execute.return_value = MagicMock(data=[{"id": "h1", "name": "Run"}])
        response = client.post("/api/v1/life/habits", json={"name": "Run"})
        assert response.status_code == 201


class TestCreateGoal:
    def test_valid_goal(self, client, mock_supabase):
        mock_supabase.execute.return_value = MagicMock(data=[{"id": "g1", "title": "Learn Python"}])
        response = client.post("/api/v1/life/goals", json={"title": "Learn Python", "category": "skill"})
        assert response.status_code == 201

    def test_missing_title_returns_422(self, client):
        response = client.post("/api/v1/life/goals", json={"category": "skill"})
        assert response.status_code == 422

    def test_invalid_target_date_returns_422(self, client):
        """target_date must be ISO format."""
        response = client.post("/api/v1/life/goals", json={
            "title": "Goal",
            "category": "personal",
            "target_date": "not-a-date",
        })
        assert response.status_code == 422

    def test_valid_target_date_accepted(self, client, mock_supabase):
        mock_supabase.execute.return_value = MagicMock(data=[{"id": "g1"}])
        response = client.post("/api/v1/life/goals", json={
            "title": "Goal",
            "category": "personal",
            "target_date": "2026-12-31",
        })
        assert response.status_code == 201


class TestAddFinance:
    def test_valid_income_entry(self, client, mock_supabase):
        mock_supabase.execute.return_value = MagicMock(data=[{"id": "f1"}])
        response = client.post("/api/v1/life/finance", json={
            "type": "income",
            "amount": 50000,
            "category": "salary",
        })
        assert response.status_code == 201

    def test_negative_amount_rejected(self, client):
        """Amount must be > 0."""
        response = client.post("/api/v1/life/finance", json={
            "type": "income",
            "amount": -100,
            "category": "salary",
        })
        assert response.status_code == 422

    def test_zero_amount_rejected(self, client):
        response = client.post("/api/v1/life/finance", json={
            "type": "income",
            "amount": 0,
            "category": "salary",
        })
        assert response.status_code == 422

    def test_invalid_type_rejected(self, client):
        """type must be 'income', 'expense', or 'savings'."""
        response = client.post("/api/v1/life/finance", json={
            "type": "donation",
            "amount": 100,
            "category": "misc",
        })
        assert response.status_code == 422


class TestLogHealth:
    def test_valid_health_log(self, client, mock_supabase):
        mock_supabase.execute.return_value = MagicMock(data=[{"id": "hl1"}])
        response = client.post("/api/v1/life/health", json={
            "metric_type": "sleep",
            "value": 7.5,
            "unit": "hours",
        })
        assert response.status_code == 201

    def test_negative_value_rejected(self, client):
        """value must be >= 0."""
        response = client.post("/api/v1/life/health", json={
            "metric_type": "sleep",
            "value": -1,
            "unit": "hours",
        })
        assert response.status_code == 422

    def test_missing_metric_type_rejected(self, client):
        response = client.post("/api/v1/life/health", json={"value": 7.5, "unit": "hours"})
        assert response.status_code == 422
