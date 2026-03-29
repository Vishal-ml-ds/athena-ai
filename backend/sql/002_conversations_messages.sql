-- ATHENA Migration 002: Conversations and Messages
-- Chat infrastructure with tenant isolation

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Conversation',
    agent_type TEXT DEFAULT 'supervisor',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    agent_name TEXT,
    tool_calls JSONB,
    tool_results JSONB,
    tokens_used INTEGER DEFAULT 0,
    model TEXT,
    latency_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent executions tracking
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    execution_graph JSONB,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    agents_involved TEXT[] DEFAULT '{}',
    total_steps INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    error TEXT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated
    ON conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_tenant
    ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
    ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_agent_executions_user
    ON agent_executions(user_id, started_at DESC);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

-- Conversations: user can only access own conversations
CREATE POLICY conversations_select ON conversations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY conversations_insert ON conversations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY conversations_delete ON conversations
    FOR DELETE USING (user_id = auth.uid());

-- Messages: accessible if user owns the parent conversation
CREATE POLICY messages_select ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

CREATE POLICY messages_insert ON messages
    FOR INSERT WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
        )
    );

-- Agent executions: user can only see own executions
CREATE POLICY agent_executions_select ON agent_executions
    FOR SELECT USING (user_id = auth.uid());

-- Service role bypass
CREATE POLICY conversations_service ON conversations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY messages_service ON messages
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY agent_executions_service ON agent_executions
    FOR ALL USING (auth.role() = 'service_role');

-- Updated_at trigger for conversations
CREATE TRIGGER conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
