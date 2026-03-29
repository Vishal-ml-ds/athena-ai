-- ATHENA Migration 004 FIX: Life OS tables
-- Run this if 004_life_os.sql failed

CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'productivity',
    frequency JSONB NOT NULL DEFAULT '{"type": "daily"}',
    streak_current INTEGER DEFAULT 0,
    streak_best INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    value FLOAT,
    notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL DEFAULT 'personal',
    target_date DATE,
    progress FLOAT DEFAULT 0,
    milestones JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'expense',
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    category TEXT NOT NULL DEFAULT 'other',
    description TEXT DEFAULT '',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    source TEXT DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL DEFAULT 'weight',
    value FLOAT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    notes TEXT DEFAULT '',
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'manual'
);

CREATE TABLE IF NOT EXISTS weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    report_data JSONB NOT NULL DEFAULT '{}',
    highlights TEXT[] DEFAULT '{}',
    nudges TEXT[] DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY habits_all ON habits FOR ALL USING (auth.role() = 'service_role' OR user_id = auth.uid());
CREATE POLICY habit_logs_all ON habit_logs FOR ALL USING (auth.role() = 'service_role' OR user_id = auth.uid());
CREATE POLICY goals_all ON goals FOR ALL USING (auth.role() = 'service_role' OR user_id = auth.uid());
CREATE POLICY finance_all ON finance_entries FOR ALL USING (auth.role() = 'service_role' OR user_id = auth.uid());
CREATE POLICY health_all ON health_logs FOR ALL USING (auth.role() = 'service_role' OR user_id = auth.uid());
CREATE POLICY reports_all ON weekly_reports FOR ALL USING (auth.role() = 'service_role' OR user_id = auth.uid());

-- Reload schema
NOTIFY pgrst, 'reload schema';
