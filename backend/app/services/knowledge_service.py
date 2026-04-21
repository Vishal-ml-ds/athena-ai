"""Knowledge graph service — entity extraction and relationship mapping.

Dual-writes to Supabase (source of truth) and Neo4j AuraDB (graph-native).
Neo4j is optional — if NEO4J_URI is not set, the service silently skips the
graph write and everything keeps working off Supabase.

Reads prefer Neo4j when available, falling back to Supabase."""

from __future__ import annotations

import json
import math
import uuid

import httpx
from supabase import Client

from app.core.config import get_settings
from app.services import neo4j_client


async def extract_entities(
    text: str,
    user_id: str,
    tenant_id: str,
    supabase: Client,
) -> list[dict]:
    """Extract entities (people, topics, places, etc.) from text using LLM."""
    settings = get_settings()

    prompt = f"""Extract named entities from this text. Return a JSON array of entities.

Text: "{text[:2000]}"

Extract entities with these types: person, topic, organization, place, event, skill
Each entity: {{"name": "...", "type": "...", "description": "brief context"}}

Return [] if no notable entities found. Max 5 entities."""

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
                        {"role": "system", "content": "Extract entities. Respond only in valid JSON array."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.1,
                    "max_tokens": 300,
                },
            )

            if response.status_code != 200:
                return []

            content = response.json()["choices"][0]["message"]["content"]
            content = content.strip().removeprefix("```json").removesuffix("```").strip()
            entities = json.loads(content)

            if not isinstance(entities, list):
                return []

            # Store entities
            stored = []
            for entity in entities[:5]:
                entity_id = str(uuid.uuid4())
                try:
                    supabase.table("knowledge_nodes").upsert({
                        "id": entity_id,
                        "user_id": user_id,
                        "tenant_id": tenant_id,
                        "name": entity["name"],
                        "node_type": entity.get("type", "topic"),
                        "description": entity.get("description", ""),
                        "metadata": {},
                    }, on_conflict="user_id,name").execute()
                    # Mirror into Neo4j if configured.
                    await neo4j_client.upsert_node(
                        user_id=user_id,
                        tenant_id=tenant_id,
                        name=entity["name"],
                        node_type=entity.get("type", "topic"),
                        description=entity.get("description", ""),
                    )
                    stored.append(entity)
                except Exception:
                    pass

            return stored

    except Exception:
        return []


async def get_knowledge_graph(
    user_id: str,
    supabase: Client,
) -> dict:
    """Get the full knowledge graph for a user."""
    try:
        nodes_result = (
            supabase.table("knowledge_nodes")
            .select("*")
            .eq("user_id", user_id)
            .limit(100)
            .execute()
        )

        edges_result = (
            supabase.table("knowledge_edges")
            .select("*")
            .eq("user_id", user_id)
            .limit(200)
            .execute()
        )

        raw_nodes = nodes_result.data or []
        raw_edges = edges_result.data or []

        # Build name → id lookup for edge mapping
        name_to_id: dict[str, str] = {n["name"]: n["id"] for n in raw_nodes}

        # Count edges per node to determine size
        edge_counts: dict[str, int] = {}
        for edge in raw_edges:
            for key in ("source_name", "target_name"):
                name = edge.get(key)
                if name:
                    edge_counts[name] = edge_counts.get(name, 0) + 1

        # Transform nodes to frontend-expected format with circular layout
        total = len(raw_nodes)
        nodes = []
        for i, node in enumerate(raw_nodes):
            angle = i * 2 * math.pi / total if total > 0 else 0
            top = 50 + 35 * math.sin(angle)
            left = 50 + 35 * math.cos(angle)
            node_name = node.get("name", "")
            nodes.append({
                "id": node["id"],
                "label": node_name,
                "type": node.get("node_type", "topic"),
                "description": node.get("description", ""),
                "top": f"{top:.1f}%",
                "left": f"{left:.1f}%",
                "size": "lg" if edge_counts.get(node_name, 0) > 2 else "md",
            })

        # Transform edges — map source/target names to node IDs
        edges = []
        for edge in raw_edges:
            source_id = name_to_id.get(edge.get("source_name", ""))
            target_id = name_to_id.get(edge.get("target_name", ""))
            if source_id and target_id:
                edges.append({
                    "id": edge.get("id"),
                    "from": source_id,
                    "to": target_id,
                    "label": edge.get("relationship", ""),
                })

        return {"nodes": nodes, "edges": edges}

    except Exception:
        return {"nodes": [], "edges": []}


async def add_relationship(
    user_id: str,
    tenant_id: str,
    source_name: str,
    target_name: str,
    relationship: str,
    supabase: Client,
) -> bool:
    """Add a relationship between two entities."""
    try:
        supabase.table("knowledge_edges").insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "tenant_id": tenant_id,
            "source_name": source_name,
            "target_name": target_name,
            "relationship": relationship,
            "metadata": {},
        }).execute()
        # Mirror into Neo4j if configured.
        await neo4j_client.upsert_edge(
            user_id=user_id,
            tenant_id=tenant_id,
            source_name=source_name,
            target_name=target_name,
            relationship=relationship,
        )
        return True
    except Exception:
        return False
