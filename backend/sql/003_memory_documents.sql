-- ATHENA Migration 003: Memory + Documents + pgvector
-- Semantic memory system and document RAG pipeline

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Memories table — ATHENA's long-term memory
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),
    memory_type TEXT DEFAULT 'fact' CHECK (memory_type IN ('fact', 'preference', 'event', 'relationship', 'insight')),
    importance FLOAT DEFAULT 0.5 CHECK (importance >= 0 AND importance <= 1),
    source TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    storage_path TEXT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('uploading', 'processing', 'ready', 'failed')),
    chunk_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Document chunks for RAG
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536),
    chunk_index INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- Indexes for vector similarity search
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON document_chunks
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Regular indexes
CREATE INDEX IF NOT EXISTS idx_memories_user_importance ON memories(user_id, importance DESC);
CREATE INDEX IF NOT EXISTS idx_memories_user_type ON memories(user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON document_chunks(document_id, chunk_index);

-- RLS Policies
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY memories_select ON memories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY memories_insert ON memories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY memories_delete ON memories FOR DELETE USING (user_id = auth.uid());

CREATE POLICY documents_select ON documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY documents_insert ON documents FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY documents_delete ON documents FOR DELETE USING (user_id = auth.uid());

CREATE POLICY chunks_select ON document_chunks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY chunks_insert ON document_chunks FOR INSERT WITH CHECK (user_id = auth.uid());

-- Service role bypass
CREATE POLICY memories_service ON memories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY documents_service ON documents FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY chunks_service ON document_chunks FOR ALL USING (auth.role() = 'service_role');
