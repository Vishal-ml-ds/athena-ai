"use client";

import { useState, useEffect } from "react";
import {
  Flame,
  Zap,
  Check,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Brain,
  Sparkles,
  Target,
  ArrowUp,
  Loader2,
} from "lucide-react";
import { useLifeStore } from "@/stores/life-store";

const TABS = ["Habits", "Goals", "Finance", "Health"] as const;
type Tab = (typeof TABS)[number];

const HEATMAP_LEVELS = [
  "bg-slate-900",
  "bg-emerald-900/40",
  "bg-emerald-700/60",
  "bg-emerald-500",
  "bg-emerald-400",
] as const;

function generateHeatmapData(): number[] {
  const data: number[] = [];
  let seed = 42;
  for (let i = 0; i < 90; i++) {
    seed = (seed * 16807 + 12345) % 2147483647;
    data.push(seed % HEATMAP_LEVELS.length);
  }
  return data;
}

const HEATMAP_DATA = generateHeatmapData();

/* ─── Sub-components ─── */

function StreakBanner({ streak }: { streak: number }) {
  const SPARKLINE_HEIGHTS = ["h-4", "h-6", "h-8", "h-10", "h-12"] as const;

  return (
    <div className="col-span-12 glass-card rounded-2xl p-8 relative overflow-hidden flex items-center justify-between border-l-4 border-l-athena-secondary">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-athena-secondary mb-1">
          <Flame className="h-5 w-5 fill-current" />
          <span className="font-mono text-sm uppercase tracking-widest">Consistency Engine</span>
        </div>
        <h3 className="text-3xl font-headline text-white">
          Current streak: <span className="text-athena-secondary">{streak} days</span>
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Keep it going! Every day counts.
        </p>
      </div>
      <div className="hidden lg:flex items-end gap-1 h-12">
        {SPARKLINE_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full ${i < 2 ? "bg-slate-800" : "bg-athena-secondary"} ${h}`}
          />
        ))}
      </div>
    </div>
  );
}

function HabitChecklist() {
  const { habits, logHabit, createHabit, isLoading } = useLifeStore();
  const [newHabitName, setNewHabitName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddHabit = async () => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;
    setIsAdding(true);
    await createHabit({ name: trimmed });
    setNewHabitName("");
    setIsAdding(false);
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-headline text-xl text-white">Daily Checklist</h4>
        <span className="text-xs font-mono text-slate-500 uppercase">
          {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </span>
      </div>

      {isLoading && habits.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      ) : habits.length === 0 ? (
        <p className="text-center text-slate-500 py-8 text-sm">
          No habits yet. Add your first one!
        </p>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => logHabit(habit.id)}
              data-testid={`habit-${habit.id}`}
              className="flex w-full items-center gap-4 group cursor-pointer p-3 rounded-xl transition-all hover:bg-white/5"
            >
              <div className="w-6 h-6 rounded flex items-center justify-center border border-slate-700 text-slate-400 group-hover:border-purple-500">
                {habit.streak_current > 0 && <Check className="h-3 w-3 text-emerald-400" />}
              </div>
              <div className="flex-1 text-left">
                <span className="font-medium text-slate-300">{habit.name}</span>
                {habit.category && (
                  <span className="ml-3 text-[10px] font-mono px-2 py-0.5 rounded text-purple-400 bg-purple-500/10">
                    {habit.category}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Zap className="h-3 w-3" />
                {habit.streak_current}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Add Habit Form */}
      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
          placeholder="Add a new habit..."
          data-testid="new-habit-input"
          className="flex-1 bg-surface-container-lowest border-none rounded-lg py-2 px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 outline-none text-sm"
        />
        <button
          onClick={handleAddHabit}
          disabled={isAdding || !newHabitName.trim()}
          data-testid="add-habit-button"
          className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg text-sm font-medium disabled:opacity-50 transition-all hover:brightness-110"
        >
          {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ActivityHeatmap() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h4 className="font-headline text-lg text-white mb-4">Activity Velocity</h4>
      <div className="flex flex-wrap gap-1.5">
        {HEATMAP_DATA.map((level, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${HEATMAP_LEVELS[level]}`} />
        ))}
      </div>
      <div className="flex justify-between mt-4 text-[10px] font-mono text-slate-500">
        <span>JAN</span>
        <span>FEB</span>
        <span>MAR</span>
        <div className="flex gap-1 items-center">
          <span>Less</span>
          <div className="w-2 h-2 bg-slate-900 rounded-sm" />
          <div className="w-2 h-2 bg-emerald-500 rounded-sm" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

function AiInsight() {
  return (
    <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-surface-container to-purple-900/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-athena-secondary flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-[#2a1700]" />
        </div>
        <span className="font-mono text-xs font-bold text-athena-secondary uppercase tracking-tight">
          Athena Pulse
        </span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed italic">
        &quot;Track your habits consistently and ATHENA will find patterns to optimize your
        routine. The more data, the smarter the insights.&quot;
      </p>
    </div>
  );
}

function GoalCards() {
  const { goals, createGoal, isLoading } = useLifeStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const GRADIENT_MAP: Record<string, string> = {
    Finance: "from-purple-600 to-amber-500",
    Health: "from-emerald-600 to-cyan-500",
    Career: "from-blue-600 to-violet-500",
    Personal: "from-pink-600 to-orange-500",
  };

  const CATEGORY_COLOR_MAP: Record<string, string> = {
    Finance: "bg-amber-500/10 text-amber-500",
    Health: "bg-emerald-500/10 text-emerald-500",
    Career: "bg-blue-500/10 text-blue-500",
    Personal: "bg-pink-500/10 text-pink-500",
  };

  const DEFAULT_GRADIENT = "from-violet-600 to-indigo-500";
  const DEFAULT_CATEGORY_COLOR = "bg-violet-500/10 text-violet-500";

  const handleAddGoal = async () => {
    const trimmedTitle = newTitle.trim();
    const trimmedCategory = newCategory.trim();
    if (!trimmedTitle || !trimmedCategory) return;
    setIsAdding(true);
    await createGoal({ title: trimmedTitle, category: trimmedCategory });
    setNewTitle("");
    setNewCategory("");
    setIsFormOpen(false);
    setIsAdding(false);
  };

  return (
    <>
      <div className="col-span-12 mt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="font-headline text-2xl text-white">Active Objectives</h3>
          <button
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="text-athena-primary text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all"
          >
            {isFormOpen ? "Cancel" : "Add Goal"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add Goal Form */}
      {isFormOpen && (
        <div className="col-span-12 glass-card rounded-2xl p-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Run a marathon"
              data-testid="new-goal-title"
              className="w-full bg-surface-container-lowest border-none rounded-lg py-2.5 px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 outline-none text-sm"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Category</label>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Health, Finance, Career"
              data-testid="new-goal-category"
              className="w-full bg-surface-container-lowest border-none rounded-lg py-2.5 px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 outline-none text-sm"
            />
          </div>
          <button
            onClick={handleAddGoal}
            disabled={isAdding || !newTitle.trim() || !newCategory.trim()}
            data-testid="add-goal-button"
            className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-medium disabled:opacity-50 transition-all hover:brightness-110"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
          </button>
        </div>
      )}

      {isLoading && goals.length === 0 ? (
        <div className="col-span-12 flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      ) : goals.length === 0 ? (
        <div className="col-span-12 glass-card rounded-2xl p-8 text-center">
          <Target className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No active goals. Set your first objective!</p>
        </div>
      ) : (
        goals.map((goal) => {
          const gradient = GRADIENT_MAP[goal.category] ?? DEFAULT_GRADIENT;
          const categoryColor = CATEGORY_COLOR_MAP[goal.category] ?? DEFAULT_CATEGORY_COLOR;
          return (
            <div
              key={goal.id}
              className="col-span-12 md:col-span-6 glass-card rounded-2xl p-6 flex flex-col justify-between h-48 group hover:border-purple-500/30 transition-all"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-tighter ${categoryColor}`}>
                    {goal.category}
                  </span>
                  {goal.target_date && (
                    <span className="text-slate-500 text-xs font-mono">
                      Target: {new Date(goal.target_date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  )}
                </div>
                <h4 className="text-xl font-headline text-white mt-3">{goal.title}</h4>
              </div>
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-mono text-white">
                    {goal.progress}<span className="text-slate-500 text-sm">%</span>
                  </span>
                  <span className="text-slate-400 text-xs capitalize">{goal.status}</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${gradient} h-full transition-all duration-500`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}

function FinanceSummarySection() {
  const { financeSummary, addFinanceEntry, isLoading } = useLifeStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddExpense = async () => {
    const numAmount = parseFloat(amount);
    const trimmedCategory = category.trim();
    if (isNaN(numAmount) || numAmount <= 0 || !trimmedCategory) return;
    setIsAdding(true);
    await addFinanceEntry({ type: "expense", amount: numAmount, category: trimmedCategory });
    setAmount("");
    setCategory("");
    setIsFormOpen(false);
    setIsAdding(false);
  };

  const stats = financeSummary
    ? [
        { label: "Monthly Income", value: `$${financeSummary.income.toLocaleString()}`, isPositive: true },
        { label: "Expenditure", value: `$${financeSummary.expenses.toLocaleString()}`, isPositive: false },
        { label: "Net Savings", value: `$${financeSummary.net.toLocaleString()}`, isPositive: true, hasBorder: true },
      ]
    : null;

  return (
    <div className="col-span-12 mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline text-xl text-white">Finance Overview</h3>
        <button
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="text-athena-primary text-sm font-medium"
        >
          {isFormOpen ? "Cancel" : "+ Add Expense"}
        </button>
      </div>

      {isFormOpen && (
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              data-testid="expense-amount"
              className="w-full bg-surface-container-lowest border-none rounded-lg py-2.5 px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 outline-none text-sm"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase">Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food, Transport"
              data-testid="expense-category"
              className="w-full bg-surface-container-lowest border-none rounded-lg py-2.5 px-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 outline-none text-sm"
            />
          </div>
          <button
            onClick={handleAddExpense}
            disabled={isAdding}
            data-testid="add-expense-button"
            className="px-6 py-2.5 bg-primary-container text-on-primary-container rounded-lg font-medium disabled:opacity-50 transition-all hover:brightness-110"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </button>
        </div>
      )}

      {isLoading && !financeSummary ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      ) : !stats ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-slate-500 text-sm">No finance data yet. Add your first entry!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`glass-card rounded-2xl p-6 ${"hasBorder" in stat && stat.hasBorder ? "border-b-2 border-athena-primary" : ""}`}
            >
              <div className="flex justify-between items-start text-slate-500 mb-2">
                <span className="text-xs font-mono uppercase">{stat.label}</span>
                <span className={`text-xs flex items-center ${stat.isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  <ArrowUp className="h-3 w-3" />
                </span>
              </div>
              <p className="text-3xl font-headline text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function HealthMetricsSection() {
  const { healthLogs, logHealth, isLoading } = useLifeStore();
  const [isLogging, setIsLogging] = useState<string | null>(null);

  const QUICK_LOG_OPTIONS = [
    { metric_type: "sleep", value: 8, unit: "hours", label: "Sleep", icon: "up" as const },
    { metric_type: "exercise", value: 30, unit: "minutes", label: "Exercise", icon: "up" as const },
    { metric_type: "rhr", value: 60, unit: "bpm", label: "RHR", icon: "down" as const },
    { metric_type: "mood", value: 4, unit: "score", label: "Mood", icon: "brain" as const },
  ];

  const handleQuickLog = async (option: typeof QUICK_LOG_OPTIONS[number]) => {
    setIsLogging(option.metric_type);
    await logHealth({ metric_type: option.metric_type, value: option.value, unit: option.unit });
    setIsLogging(null);
  };

  /* Get latest value for each metric type from healthLogs */
  const latestByType = healthLogs.reduce<Record<string, { value: number; unit: string }>>((acc, log) => {
    if (!acc[log.metric_type]) {
      acc[log.metric_type] = { value: log.value, unit: log.unit };
    }
    return acc;
  }, {});

  return (
    <div className="col-span-12 mt-4 space-y-4">
      <h3 className="font-headline text-xl text-white">Health Metrics</h3>

      {isLoading && healthLogs.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_LOG_OPTIONS.map((option) => {
            const latest = latestByType[option.metric_type];
            return (
              <div key={option.metric_type} className="glass-card p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{option.label}</p>
                  <p className="text-xl font-headline text-white">
                    {latest ? `${latest.value} ${latest.unit}` : "--"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {option.icon === "up" && <TrendingUp className="h-5 w-5 text-emerald-400" />}
                  {option.icon === "down" && <TrendingDown className="h-5 w-5 text-emerald-400" />}
                  {option.icon === "brain" && <Brain className="h-5 w-5 text-purple-400" />}
                  <button
                    onClick={() => handleQuickLog(option)}
                    disabled={isLogging === option.metric_type}
                    data-testid={`log-${option.metric_type}`}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-athena-primary hover:bg-white/10 transition-all disabled:opacity-50"
                    title={`Quick log ${option.label}`}
                  >
                    {isLogging === option.metric_type ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */

export default function LifeOSDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Habits");
  const { habits, fetchHabits, fetchGoals, fetchFinanceSummary, fetchHealth, isLoading } = useLifeStore();

  useEffect(() => {
    fetchHabits();
    fetchGoals();
    fetchFinanceSummary();
    fetchHealth();
  }, [fetchHabits, fetchGoals, fetchFinanceSummary, fetchHealth]);

  /* Best streak across all habits */
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak_current), 0);

  return (
    <div className="flex-1 overflow-y-auto bg-athena-background">
      {/* Top Tab Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-xl shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)]">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-headline tracking-widest text-white uppercase text-xl font-light">
              ATHENA AI
            </span>
            <nav className="hidden md:flex gap-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-headline text-sm tracking-tight pb-1 transition-colors ${
                    activeTab === tab
                      ? "text-purple-400 font-medium border-b-2 border-purple-500"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-8 pb-12 pt-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Contextual Header */}
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-4xl font-light font-headline tracking-tight text-white">
                Focus: <span className="text-athena-primary">{activeTab}</span>
              </h2>
              <p className="text-slate-400 mt-2">
                Synchronizing performance data for your daily ritual.
              </p>
            </div>
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-athena-secondary animate-pulse" />
              <span className="font-mono text-xs text-athena-secondary">AI OPTIMIZATION ACTIVE</span>
            </div>
          </div>

          {/* Dashboard Grid — filtered by active tab */}
          <div className="grid grid-cols-12 gap-6">
            {activeTab === "Habits" && (
              <>
                <StreakBanner streak={bestStreak} />
                <div className="col-span-12 lg:col-span-7 space-y-6">
                  <HabitChecklist />
                </div>
                <div className="col-span-12 lg:col-span-5 space-y-6">
                  <ActivityHeatmap />
                  <AiInsight />
                </div>
              </>
            )}

            {activeTab === "Goals" && <GoalCards />}
            {activeTab === "Finance" && <FinanceSummarySection />}
            {activeTab === "Health" && <HealthMetricsSection />}
          </div>
        </div>
      </div>

      {/* Background glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-amber-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
}
