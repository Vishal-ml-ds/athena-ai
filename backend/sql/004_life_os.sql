-- ATHENA Migration 004: Life OS
-- Habits, goals, finance, health tracking

-- Habits
CREATE TABLE IF NOT EXISTS habits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'productivity' CHECK (category IN ('health', 'finance', 'learning', 'productivity', 'social')),
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
    notes TEXT,
    UNIQUE(habit_id, (completed_at::date))
);

-- Goals
CREATE TABLE IF NOT EXISTS goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    target_date DATE,
    progress FLOAT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    milestones JSONB DEFAULT '[]',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finance
CREATE TABLE IF NOT EXISTS finance_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'savings')),
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    source TEXT DEFAULT 'manual',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health
CREATE TABLE IF NOT EXISTS health_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN ('weight', 'sleep', 'exercise', 'mood', 'water', 'calories')),
    value FLOAT NOT NULL,
    unit TEXT NOT NULL,
    notes TEXT,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'manual'
);

-- Weekly Reports
CREATE TABLE IF NOT EXISTS weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    report_data JSONB NOT NULL DEFAULT '{}',
    highlights TEXT[] DEFAULT '{}',
    nudges TEXT[] DEFAULT '{}',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit ON habit_logs(habit_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_finance_user_date ON finance_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_user_category ON finance_entries(user_id, category);
CREATE INDEX IF NOT EXISTS idx_health_user_type ON health_logs(user_id, metric_type, logged_at DESC);

-- RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY habits_user ON habits FOR ALL USING (user_id = auth.uid());
CREATE POLICY habit_logs_user ON habit_logs FOR ALL USING (user_id = auth.uid());
CREATE POLICY goals_user ON goals FOR ALL USING (user_id = auth.uid());
CREATE POLICY finance_user ON finance_entries FOR ALL USING (user_id = auth.uid());
CREATE POLICY health_user ON health_logs FOR ALL USING (user_id = auth.uid());
CREATE POLICY reports_user ON weekly_reports FOR ALL USING (user_id = auth.uid());

-- Service role bypass
CREATE POLICY habits_service ON habits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY habit_logs_service ON habit_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY goals_service ON goals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY finance_service ON finance_entries FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY health_service ON health_logs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY reports_service ON weekly_reports FOR ALL USING (auth.role() = 'service_role');
