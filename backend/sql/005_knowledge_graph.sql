-- ATHENA Migration 005: Knowledge Graph
-- Entity nodes and relationship edges

CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    node_type TEXT DEFAULT 'topic' CHECK (node_type IN ('person', 'topic', 'organization', 'place', 'event', 'skill', 'goal', 'memory')),
    description TEXT DEFAULT '',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE TABLE IF NOT EXISTS knowledge_edges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL,
    target_name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nodes_user ON knowledge_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_nodes_type ON knowledge_nodes(user_id, node_type);
CREATE INDEX IF NOT EXISTS idx_edges_user ON knowledge_edges(user_id);
CREATE INDEX IF NOT EXISTS idx_edges_source ON knowledge_edges(source_name);

ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY nodes_user ON knowledge_nodes FOR ALL USING (user_id = auth.uid());
CREATE POLICY edges_user ON knowledge_edges FOR ALL USING (user_id = auth.uid());
CREATE POLICY nodes_service ON knowledge_nodes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY edges_service ON knowledge_edges FOR ALL USING (auth.role() = 'service_role');
