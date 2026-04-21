"""Tests for documents router — upload validation, chunking, query."""

from __future__ import annotations

import io
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from tests.conftest import *  # noqa: F401, F403


@pytest.fixture
def client(mock_supabase, mock_tenant_context):
    from fastapi import FastAPI
    from app.core.dependencies import get_supabase_client
    from app.core.security import get_current_user
    from app.routers.documents import router

    app = FastAPI()
    app.include_router(router)
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    app.dependency_overrides[get_current_user] = lambda: mock_tenant_context

    return TestClient(app)


class TestUploadDocument:
    def test_upload_creates_db_row(self, client, mock_supabase):
        """Upload should insert a document row and return 202."""
        mock_supabase.execute.return_value = MagicMock(data=[{"id": "doc-1"}])

        with patch("app.routers.documents._process_document"):
            with patch("app.routers.documents._process_document", new_callable=AsyncMock):
                response = client.post(
                    "/api/v1/documents",
                    files={"file": ("test.txt", io.BytesIO(b"hello world"), "text/plain")},
                )

        assert response.status_code == 201
        assert response.json()["success"] is True

    def test_unsupported_mime_type_rejected(self, client):
        """Only PDF/text/json/csv/md are allowed."""
        response = client.post(
            "/api/v1/documents",
            files={"file": ("malware.exe", io.BytesIO(b"MZ"), "application/x-msdownload")},
        )
        assert response.status_code == 415

    def test_oversized_file_rejected(self, client):
        """Files over 50 MB should be rejected."""
        big_file = io.BytesIO(b"x" * (51 * 1024 * 1024))
        response = client.post(
            "/api/v1/documents",
            files={"file": ("big.txt", big_file, "text/plain")},
        )
        assert response.status_code == 413


class TestChunkText:
    def test_short_text_single_chunk(self):
        from app.routers.documents import _chunk_text
        result = _chunk_text("Hello world", chunk_size=100, overlap=10)
        assert len(result) == 1
        assert result[0] == "Hello world"

    def test_long_text_splits_into_chunks(self):
        from app.routers.documents import _chunk_text
        # ~600 chars → should split with chunk_size=100 (400 chars)
        text = "word " * 200  # 1000 chars
        chunks = _chunk_text(text, chunk_size=100, overlap=10)
        assert len(chunks) > 1

    def test_empty_text_returns_empty(self):
        from app.routers.documents import _chunk_text
        result = _chunk_text("", chunk_size=100, overlap=10)
        assert result == []

    def test_whitespace_only_filtered_out(self):
        from app.routers.documents import _chunk_text
        result = _chunk_text("   \n\n   ", chunk_size=100, overlap=10)
        assert result == []


class TestQueryDocuments:
    def test_empty_query_rejected(self, client):
        # Pydantic min_length=1 → 422; but our HTTPException is 400 for whitespace-only.
        # Empty string hits Pydantic first → 422.
        response = client.post("/api/v1/documents/query", json={"query": ""})
        # Empty string caught by Pydantic min_length=1
        assert response.status_code in (400, 422)

    def test_query_returns_answer_and_sources(self, client, mock_supabase):
        """Should return answer + sources when chunks exist."""
        # Embedding call
        with patch("app.routers.documents._generate_embedding", AsyncMock(return_value=[0.1] * 1536)):
            # RPC returns chunks
            mock_supabase.execute.return_value = MagicMock(data=[
                {"id": "c1", "content": "ATHENA is an AI OS", "document_id": "d1", "chunk_index": 0, "similarity": 0.9}
            ])

            # LLM synthesis
            fake_llm_response = MagicMock(
                status_code=200,
                json=lambda: {"choices": [{"message": {"content": "ATHENA is an AI Operating System."}}]}
            )

            with patch("httpx.AsyncClient") as mock_http:
                mock_http.return_value.__aenter__.return_value.post = AsyncMock(return_value=fake_llm_response)
                mock_supabase.execute.side_effect = [
                    MagicMock(data=[{"id": "c1", "content": "ATHENA is an AI OS", "document_id": "d1", "chunk_index": 0, "similarity": 0.9}]),
                    MagicMock(data=[{"id": "d1", "filename": "test.pdf"}]),
                ]
                response = client.post("/api/v1/documents/query", json={"query": "What is ATHENA?"})

        assert response.status_code == 200
        data = response.json()["data"]
        assert "answer" in data
        assert "sources" in data
