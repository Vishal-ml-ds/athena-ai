# ATHENA — Database Schema (Low-Level Design)

## Overview

ATHENA uses a multi-database architecture:
- **Supabase PostgreSQL** — Core relational data + vector embeddings (pgvector)
- **Neo4j AuraDB** — Knowledge graph (entities + relationships)
- **Redis (Upstash)** — Cache, sessions, rate limiting, job queue
- **Cloudflare R2** — File storage (documents, screenshots, voice recordings)

All PostgreSQL tables enforce **Row-Level Security (RLS)** with `tenant_id` for multi-tenant isolation.

---

## Supabase PostgreSQL Tables

### 1. Tenant & Auth Domain

#### `tenants`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Tenant identifier |
| name | text | NOT NULL | Organization/account name |
| plan | text | NOT NULL, CHECK (plan IN ('free','pro','ultra','developer')) | Subscription tier |
| settings | jsonb | DEFAULT '{}' | Tenant-level config |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update |

#### `profiles` (extends Supabase auth.users)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, FK → auth.users(id) ON DELETE CASCADE | User identifier |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant association |
| display_name | text | NOT NULL | User's display name |
| avatar_url | text | | Profile picture URL |
| preferences | jsonb | DEFAULT '{}' | timezone, language, voice_id, theme |
| onboarding_completed | boolean | DEFAULT false | Onboarding status |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last update |

**RLS Policy:**
```sql
CREATE POLICY tenant_isolation ON profiles
  USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);
CREATE POLICY own_profile ON profiles
  USING (id = auth.uid());
```

---

### 2. Agent & Conversation Domain

#### `conversations`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Conversation identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| title | text | DEFAULT 'New Conversation' | Auto-generated or user-set title |
| agent_type | text | DEFAULT 'supervisor' | Primary agent used |
| metadata | jsonb | DEFAULT '{}' | Tags, pinned status, etc. |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |
| updated_at | timestamptz | DEFAULT now() | Last activity |

**Indexes:** `(user_id, updated_at DESC)` for conversation list

#### `messages`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Message identifier |
| conversation_id | uuid | FK → conversations(id) ON DELETE CASCADE | Parent conversation |
| role | text | NOT NULL, CHECK (role IN ('user','assistant','system','tool')) | Message role |
| content | text | NOT NULL | Message content |
| agent_name | text | | Which agent responded (researcher, scheduler, etc.) |
| tool_calls | jsonb | | Tool invocations made |
| tool_results | jsonb | | Tool execution results |
| tokens_used | integer | DEFAULT 0 | Token consumption |
| model | text | | LLM model used |
| latency_ms | integer | | Response time |
| created_at | timestamptz | DEFAULT now() | Creation timestamp |

**Indexes:** `(conversation_id, created_at)` for message timeline

#### `agent_executions`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Execution identifier |
| conversation_id | uuid | FK → conversations(id) | Parent conversation |
| user_id | uuid | FK → profiles(id), NOT NULL | User who triggered |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| execution_graph | jsonb | | LangGraph state snapshot |
| status | text | CHECK (status IN ('running','completed','failed','cancelled')) | Execution state |
| agents_involved | text[] | DEFAULT '{}' | List of agents used |
| total_steps | integer | DEFAULT 0 | Number of reasoning steps |
| total_tokens | integer | DEFAULT 0 | Total tokens consumed |
| error | text | | Error message if failed |
| started_at | timestamptz | DEFAULT now() | Start time |
| completed_at | timestamptz | | Completion time |

---

### 3. Memory & RAG Domain

#### `memories`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Memory identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| content | text | NOT NULL | Memory content |
| embedding | vector(1536) | | OpenAI text-embedding-3-small vector |
| memory_type | text | CHECK (type IN ('fact','preference','event','relationship','insight')) | Classification |
| importance | float | DEFAULT 0.5, CHECK (importance >= 0 AND importance <= 1) | Decaying importance score |
| source | text | | conversation_id, manual, or inferred |
| metadata | jsonb | DEFAULT '{}' | Additional context |
| created_at | timestamptz | DEFAULT now() | When learned |
| last_accessed | timestamptz | DEFAULT now() | Last retrieval time |

**Indexes:**
- `CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`
- `(user_id, importance DESC)` for prioritized retrieval
- `(user_id, memory_type)` for filtered search

#### `documents`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Document identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| filename | text | NOT NULL | Original filename |
| mime_type | text | NOT NULL | File type |
| file_size | bigint | NOT NULL | Size in bytes |
| storage_path | text | NOT NULL | R2/S3 object key |
| status | text | CHECK (status IN ('uploading','processing','ready','failed')) | Pipeline status |
| chunk_count | integer | DEFAULT 0 | Number of chunks |
| metadata | jsonb | DEFAULT '{}' | Page count, extracted title, etc. |
| created_at | timestamptz | DEFAULT now() | Upload time |
| processed_at | timestamptz | | Completion time |

#### `document_chunks`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Chunk identifier |
| document_id | uuid | FK → documents(id) ON DELETE CASCADE | Parent document |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner (for RLS) |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| content | text | NOT NULL | Chunk text |
| embedding | vector(1536) | | Chunk embedding |
| chunk_index | integer | NOT NULL | Order within document |
| metadata | jsonb | DEFAULT '{}' | Page number, section heading |

**Indexes:**
- `CREATE INDEX ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`
- `(document_id, chunk_index)` for ordered retrieval

---

### 4. Task & Automation Domain

#### `tasks`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Task identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| title | text | NOT NULL | Task title |
| description | text | | Task details |
| status | text | DEFAULT 'pending', CHECK (status IN ('pending','in_progress','completed','failed','cancelled')) | Task state |
| priority | text | DEFAULT 'medium', CHECK (priority IN ('low','medium','high','urgent')) | Priority level |
| agent_type | text | | Which agent handles this |
| scheduled_at | timestamptz | | When to execute |
| completed_at | timestamptz | | Completion time |
| result | jsonb | | Task output |
| error | text | | Error if failed |
| created_at | timestamptz | DEFAULT now() | Creation time |

#### `browser_sessions`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Session identifier |
| task_id | uuid | FK → tasks(id) | Parent task |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| url | text | | Current URL |
| status | text | CHECK (status IN ('active','completed','failed')) | Session state |
| screenshots | text[] | DEFAULT '{}' | R2 storage paths |
| action_log | jsonb[] | DEFAULT '{}' | Array of {action, selector, timestamp} |
| created_at | timestamptz | DEFAULT now() | Start time |
| completed_at | timestamptz | | End time |

---

### 5. Life OS Domain

#### `habits`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Habit identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| name | text | NOT NULL | Habit name |
| description | text | | Habit details |
| category | text | CHECK (category IN ('health','finance','learning','productivity','social')) | Category |
| frequency | jsonb | NOT NULL | {type: 'daily'|'weekdays'|'custom', days: []} |
| streak_current | integer | DEFAULT 0 | Current streak |
| streak_best | integer | DEFAULT 0 | All-time best streak |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamptz | DEFAULT now() | Creation time |

#### `habit_logs`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Log identifier |
| habit_id | uuid | FK → habits(id) ON DELETE CASCADE | Parent habit |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner (for RLS) |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| completed_at | timestamptz | DEFAULT now() | When completed |
| value | float | | Quantified value (optional) |
| notes | text | | Optional notes |

**Unique constraint:** `(habit_id, completed_at::date)` — one log per habit per day

#### `goals`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Goal identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| title | text | NOT NULL | Goal title |
| description | text | | Goal details |
| category | text | NOT NULL | Category (career, health, finance, learning, personal) |
| target_date | date | | Deadline |
| progress | float | DEFAULT 0, CHECK (progress >= 0 AND progress <= 100) | Percentage complete |
| milestones | jsonb[] | DEFAULT '{}' | [{title, completed, date}] |
| status | text | DEFAULT 'active', CHECK (status IN ('active','completed','paused','abandoned')) | Goal state |
| created_at | timestamptz | DEFAULT now() | Creation time |

#### `finance_entries`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Entry identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| type | text | NOT NULL, CHECK (type IN ('income','expense','investment','savings')) | Entry type |
| amount | decimal(12,2) | NOT NULL | Amount |
| currency | text | DEFAULT 'INR' | Currency code |
| category | text | NOT NULL | Category (food, transport, rent, etc.) |
| description | text | | Entry description |
| date | date | NOT NULL | Transaction date |
| source | text | DEFAULT 'manual' | manual, agent, or integration name |
| metadata | jsonb | DEFAULT '{}' | Additional data |
| created_at | timestamptz | DEFAULT now() | Creation time |

**Indexes:** `(user_id, date DESC)`, `(user_id, category)`

#### `health_logs`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Log identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| metric_type | text | NOT NULL, CHECK (metric_type IN ('weight','sleep','exercise','mood','water','calories')) | Metric type |
| value | float | NOT NULL | Metric value |
| unit | text | NOT NULL | Unit (kg, hours, minutes, 1-10, ml, kcal) |
| notes | text | | Optional notes |
| logged_at | timestamptz | DEFAULT now() | When logged |
| source | text | DEFAULT 'manual' | manual, agent, or integration |

#### `weekly_reports`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Report identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| week_start | date | NOT NULL | Monday of the report week |
| report_data | jsonb | NOT NULL | Structured data per category |
| highlights | text[] | DEFAULT '{}' | Top achievements |
| nudges | text[] | DEFAULT '{}' | Improvement suggestions |
| generated_at | timestamptz | DEFAULT now() | Generation time |

**Unique constraint:** `(user_id, week_start)` — one report per user per week

---

### 6. Security & Audit Domain

#### `audit_logs`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Log identifier |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant |
| user_id | uuid | FK → profiles(id) | User who performed action |
| action | text | NOT NULL | Action type (create, update, delete, access) |
| resource_type | text | NOT NULL | Table/entity affected |
| resource_id | uuid | | Specific record ID |
| ip_address | inet | | Client IP |
| user_agent | text | | Client user agent |
| metadata | jsonb | DEFAULT '{}' | Action details |
| created_at | timestamptz | DEFAULT now() | Timestamp |

**Index:** `(tenant_id, created_at DESC)` for audit queries
**Partition by:** `RANGE (created_at)` — monthly partitions for performance

#### `api_keys`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Key identifier |
| user_id | uuid | FK → profiles(id), NOT NULL | Owner |
| tenant_id | uuid | FK → tenants(id), NOT NULL | Tenant (for RLS) |
| key_hash | text | NOT NULL, UNIQUE | bcrypt hash (never store plaintext) |
| key_prefix | text | NOT NULL | First 8 chars for identification (athena_xxx) |
| name | text | NOT NULL | Key name/label |
| scopes | text[] | DEFAULT '{}' | Allowed operations |
| last_used | timestamptz | | Last usage time |
| expires_at | timestamptz | | Expiration (null = never) |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamptz | DEFAULT now() | Creation time |

---

## Neo4j Knowledge Graph Schema

### Node Types

```cypher
(:Person {id, user_id, name, role, metadata, created_at})
(:Topic {id, user_id, name, category, description, created_at})
(:Event {id, user_id, name, date, location, created_at})
(:Place {id, user_id, name, type, created_at})
(:Organization {id, user_id, name, type, created_at})
(:Skill {id, user_id, name, level, created_at})
(:Goal {id, user_id, name, status, created_at})
(:Memory {id, user_id, content, source, created_at})
```

### Edge Types

```cypher
(:Person)-[:KNOWS]->(:Person)
(:Person)-[:WORKS_AT]->(:Organization)
(:Person)-[:INTERESTED_IN]->(:Topic)
(:Person)-[:HAS_SKILL]->(:Skill)
(:Topic)-[:RELATED_TO]->(:Topic)
(:Event)-[:HAPPENED_AT]->(:Place)
(:Goal)-[:DEPENDS_ON]->(:Goal)
(:Memory)-[:MENTIONED_IN]->(:Topic)
(:Memory)-[:ABOUT]->(:Person)
(:Event)-[:LEADS_TO]->(:Event)
```

### Tenant Isolation
Every node has a `user_id` property. All Cypher queries filter by `user_id`:
```cypher
MATCH (n {user_id: $userId})-[r]->(m {user_id: $userId})
RETURN n, r, m
```

---

## Redis Key Schema

```
# Rate limiting
rate:{tenant_id}:{endpoint}:{window} → counter (TTL: window duration)

# Session data
session:{user_id} → JSON (TTL: 24h)

# Agent execution cache
agent_exec:{execution_id} → JSON (TTL: 1h)

# WebSocket pub/sub channels
ws:{conversation_id} → pub/sub channel

# Celery job results
celery-task-meta-{task_id} → JSON (TTL: 24h)
```

---

## Migration Order

1. `001_tenants_profiles.sql` — tenants, profiles, RLS policies
2. `002_conversations_messages.sql` — conversations, messages, agent_executions
3. `003_memory_documents.sql` — memories, documents, document_chunks, pgvector indexes
4. `004_tasks_browser.sql` — tasks, browser_sessions
5. `005_life_os.sql` — habits, habit_logs, goals, finance_entries, health_logs, weekly_reports
6. `006_security_audit.sql` — audit_logs, api_keys

Each migration is idempotent (uses `CREATE TABLE IF NOT EXISTS`).
