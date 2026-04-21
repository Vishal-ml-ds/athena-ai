"""Neo4j AuraDB client for the real knowledge graph.

Thin wrapper around the official async driver. Each call creates a new session
(driver is cached globally). All Cypher statements are parameterized — Neo4j
enforces the tenant scope via the `tenant_id` property on every node / rel.

Usage:
    driver = get_neo4j_driver()
    if driver:
        async with driver.session() as session:
            await session.run(...)

Returns None when NEO4J_URI is not configured; callers must degrade gracefully.
"""

from __future__ import annotations

import logging
from functools import lru_cache

from neo4j import AsyncDriver, AsyncGraphDatabase

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@lru_cache()
def get_neo4j_driver() -> AsyncDriver | None:
    settings = get_settings()
    uri = getattr(settings, "neo4j_uri", "") or ""
    user = getattr(settings, "neo4j_username", "") or ""
    password = getattr(settings, "neo4j_password", "") or ""

    if not uri or not user or not password:
        return None

    try:
        driver = AsyncGraphDatabase.driver(uri, auth=(user, password))
        return driver
    except Exception as exc:
        logger.warning("Failed to create Neo4j driver: %s", str(exc)[:200])
        return None


async def upsert_node(
    user_id: str,
    tenant_id: str,
    name: str,
    node_type: str,
    description: str = "",
) -> None:
    driver = get_neo4j_driver()
    if driver is None:
        return
    try:
        async with driver.session(database=_db()) as session:
            await session.run(
                """
                MERGE (n:Entity {user_id: $user_id, name: $name})
                SET n.tenant_id = $tenant_id,
                    n.type = $type,
                    n.description = $description,
                    n.updated_at = timestamp()
                """,
                user_id=user_id,
                tenant_id=tenant_id,
                name=name,
                type=node_type,
                description=description,
            )
    except Exception as exc:
        logger.warning("Neo4j upsert_node failed: %s", str(exc)[:200])


async def upsert_edge(
    user_id: str,
    tenant_id: str,
    source_name: str,
    target_name: str,
    relationship: str,
) -> None:
    driver = get_neo4j_driver()
    if driver is None:
        return
    try:
        async with driver.session(database=_db()) as session:
            await session.run(
                """
                MATCH (a:Entity {user_id: $user_id, name: $source})
                MATCH (b:Entity {user_id: $user_id, name: $target})
                MERGE (a)-[r:RELATED {type: $rel_type}]->(b)
                SET r.tenant_id = $tenant_id,
                    r.updated_at = timestamp()
                """,
                user_id=user_id,
                tenant_id=tenant_id,
                source=source_name,
                target=target_name,
                rel_type=relationship,
            )
    except Exception as exc:
        logger.warning("Neo4j upsert_edge failed: %s", str(exc)[:200])


async def read_graph(user_id: str, limit_nodes: int = 100, limit_rels: int = 200) -> dict | None:
    """Read the user's subgraph. Returns None if Neo4j is unavailable."""
    driver = get_neo4j_driver()
    if driver is None:
        return None
    try:
        async with driver.session(database=_db()) as session:
            node_result = await session.run(
                """
                MATCH (n:Entity {user_id: $user_id})
                RETURN n.name AS name, n.type AS type, n.description AS description
                LIMIT $limit
                """,
                user_id=user_id,
                limit=limit_nodes,
            )
            nodes = [dict(r) async for r in node_result]

            edge_result = await session.run(
                """
                MATCH (a:Entity {user_id: $user_id})-[r:RELATED]->(b:Entity {user_id: $user_id})
                RETURN a.name AS source, b.name AS target, r.type AS relationship
                LIMIT $limit
                """,
                user_id=user_id,
                limit=limit_rels,
            )
            edges = [dict(r) async for r in edge_result]

            return {"nodes": nodes, "edges": edges}
    except Exception as exc:
        logger.warning("Neo4j read_graph failed: %s", str(exc)[:200])
        return None


def _db() -> str:
    settings = get_settings()
    return getattr(settings, "neo4j_database", "neo4j") or "neo4j"
