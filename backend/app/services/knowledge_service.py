"""Knowledge graph service — entity extraction and relationship mapping.

Uses Supabase tables instead of Neo4j for Sprint 7 MVP.
Neo4j integration can be added later for graph-native queries."""

import json
import uuid

import httpx
from supabase import Client

from app.core.config import get_settings


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

        return {
            "nodes": nodes_result.data or [],
            "edges": edges_result.data or [],
        }

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
        return True
    except Exception:
        return False
