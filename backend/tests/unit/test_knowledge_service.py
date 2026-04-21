"""Tests for knowledge_service — node format fix, circular layout, entity extraction."""

from __future__ import annotations

import math
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from tests.conftest import *  # noqa: F401, F403


class TestGetKnowledgeGraph:
    """Verify the node format transformation is correct."""

    @pytest.mark.asyncio
    async def test_empty_graph_returns_empty_lists(self, mock_supabase):
        from app.services.knowledge_service import get_knowledge_graph
        mock_supabase.execute.return_value = MagicMock(data=[])
        result = await get_knowledge_graph("user-1", mock_supabase)
        assert result == {"nodes": [], "edges": []}

    @pytest.mark.asyncio
    async def test_node_has_label_not_name(self, mock_supabase):
        """Nodes must have 'label' field (not 'name') for the frontend."""
        from app.services.knowledge_service import get_knowledge_graph

        raw_nodes = [{"id": "n1", "name": "Vishal", "node_type": "person", "description": ""}]
        raw_edges = []

        call_count = 0
        def execute_side_effect():
            nonlocal call_count
            call_count += 1
            if call_count == 1:
                return MagicMock(data=raw_nodes)
            return MagicMock(data=raw_edges)

        mock_supabase.execute.side_effect = execute_side_effect

        result = await get_knowledge_graph("user-1", mock_supabase)
        node = result["nodes"][0]
        assert node["label"] == "Vishal", "Should map 'name' → 'label'"
        assert "name" not in node, "Raw 'name' field should not leak through"

    @pytest.mark.asyncio
    async def test_node_has_type_not_node_type(self, mock_supabase):
        """Nodes must have 'type' field (not 'node_type')."""
        from app.services.knowledge_service import get_knowledge_graph

        raw_nodes = [{"id": "n1", "name": "Vishal", "node_type": "person", "description": ""}]

        call_count = 0
        def execute_side_effect():
            nonlocal call_count
            call_count += 1
            return MagicMock(data=raw_nodes if call_count == 1 else [])

        mock_supabase.execute.side_effect = execute_side_effect

        result = await get_knowledge_graph("user-1", mock_supabase)
        node = result["nodes"][0]
        assert node["type"] == "person", "Should map 'node_type' → 'type'"
        assert "node_type" not in node

    @pytest.mark.asyncio
    async def test_nodes_have_position_fields(self, mock_supabase):
        """Every node must have 'top' and 'left' as percentage strings."""
        from app.services.knowledge_service import get_knowledge_graph

        raw_nodes = [{"id": "n1", "name": "Test", "node_type": "topic", "description": ""}]

        call_count = 0
        def execute_side_effect():
            nonlocal call_count
            call_count += 1
            return MagicMock(data=raw_nodes if call_count == 1 else [])

        mock_supabase.execute.side_effect = execute_side_effect

        result = await get_knowledge_graph("user-1", mock_supabase)
        node = result["nodes"][0]
        assert "top" in node and node["top"].endswith("%")
        assert "left" in node and node["left"].endswith("%")

    @pytest.mark.asyncio
    async def test_nodes_have_size_field(self, mock_supabase):
        """Nodes must have 'size': 'md' or 'lg'."""
        from app.services.knowledge_service import get_knowledge_graph

        raw_nodes = [{"id": "n1", "name": "Test", "node_type": "topic", "description": ""}]

        call_count = 0
        def execute_side_effect():
            nonlocal call_count
            call_count += 1
            return MagicMock(data=raw_nodes if call_count == 1 else [])

        mock_supabase.execute.side_effect = execute_side_effect

        result = await get_knowledge_graph("user-1", mock_supabase)
        node = result["nodes"][0]
        assert node["size"] in ("md", "lg")

    @pytest.mark.asyncio
    async def test_edges_use_from_to_not_source_target(self, mock_supabase):
        """Edges must use 'from'/'to' (IDs), not 'source_name'/'target_name'."""
        from app.services.knowledge_service import get_knowledge_graph

        raw_nodes = [
            {"id": "n1", "name": "Alice", "node_type": "person", "description": ""},
            {"id": "n2", "name": "ATHENA", "node_type": "topic", "description": ""},
        ]
        raw_edges = [
            {"id": "e1", "source_name": "Alice", "target_name": "ATHENA", "relationship": "uses"},
        ]

        call_count = 0
        def execute_side_effect():
            nonlocal call_count
            call_count += 1
            return MagicMock(data=raw_nodes if call_count == 1 else raw_edges)

        mock_supabase.execute.side_effect = execute_side_effect

        result = await get_knowledge_graph("user-1", mock_supabase)
        assert len(result["edges"]) == 1
        edge = result["edges"][0]
        assert edge["from"] == "n1"
        assert edge["to"] == "n2"
        assert "source_name" not in edge
        assert "target_name" not in edge

    @pytest.mark.asyncio
    async def test_exception_returns_empty_graph(self, mock_supabase):
        """Exceptions should be swallowed — return empty graph, not 500."""
        from app.services.knowledge_service import get_knowledge_graph
        mock_supabase.execute.side_effect = Exception("DB error")
        result = await get_knowledge_graph("user-1", mock_supabase)
        assert result == {"nodes": [], "edges": []}


class TestExtractEntities:
    @pytest.mark.asyncio
    async def test_returns_empty_on_llm_failure(self, mock_supabase):
        """Should return [] when LLM call fails — never raise."""
        from app.services.knowledge_service import extract_entities
        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=Exception("Network error")
            )
            result = await extract_entities("some text", "user-1", "tenant-1", mock_supabase)
        assert result == []

    @pytest.mark.asyncio
    async def test_stores_extracted_entities(self, mock_supabase):
        """Should upsert entities when LLM returns valid JSON."""
        from app.services.knowledge_service import extract_entities

        fake_response = MagicMock(
            status_code=200,
            json=lambda: {
                "choices": [{"message": {"content": '[{"name": "Alice", "type": "person", "description": "test"}]'}}]
            }
        )

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(return_value=fake_response)
            mock_supabase.execute.return_value = MagicMock(data=[])
            result = await extract_entities("Alice is here", "user-1", "tenant-1", mock_supabase)

        assert len(result) == 1
        assert result[0]["name"] == "Alice"
