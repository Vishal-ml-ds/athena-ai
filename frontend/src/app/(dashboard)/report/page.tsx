"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Star,
  CheckCircle,
  Sparkles,
  Target,
  Wallet,
  Activity,
  Lightbulb,
  ChevronRight,
  TrendingUp,
  FileDown,
  Share2,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api/client";

// --- Types ---

interface Habit {
  id: string;
  name: string;
  current_streak: number;
  completion_rate: number;
}

interface Goal {
  id: string;
  title: string;
  progress: number;
  description: string;
}

interface FinanceSummary {
  total_income?: number;
  total_expenses?: number;
  income?: number;
  expenses?: number;
  savings: number;
  top_categories?: { name: string; percent: number }[];
  by_category?: Record<string, number>;
}

interface HealthTrends {
  sleep: { average: string; change: string; is_positive: boolean };
  exercise: { average: string; change: string; is_positive: boolean };
  weight: { current: string; change: string; is_positive: boolean };
}

interface ReportData {
  habits: Habit[];
  goals: Goal[];
  finance: FinanceSummary | null;
  health: HealthTrends | null;
  aiInsights: string | null;
}

// --- Sub-components ---

function ReportSection({
  icon,
  title,
  titleColor = "text-white",
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  titleColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`p-8 rounded-xl bg-[#131b2e] border border-[#4a4455]/10 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {icon}
        <h2 className={`text-xl font-headline font-semibold uppercase tracking-wider ${titleColor}`}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0b1326] min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-[#d2bbff] animate-spin" />
        <span className="font-mono text-sm text-slate-400">Generating your weekly report...</span>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#0b1326] min-h-screen">
      <div className="max-w-md text-center px-8">
        <div className="w-20 h-20 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mx-auto mb-6">
          <Sparkles className="h-10 w-10 text-[#d2bbff]" />
        </div>
        <h2 className="text-2xl font-headline font-bold text-[#dae2fd] mb-3">
          No Report Yet
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Complete a week of tracking habits, goals, and finances to generate your first weekly report.
        </p>
      </div>
    </div>
  );
}

function HabitsSection({ habits }: { habits: Habit[] }) {
  return (
    <ReportSection
      icon={<Target className="h-5 w-5 text-[#d2bbff]" />}
      title="Habits Summary"
    >
      <div className="space-y-6 mb-8">
        {habits.map((habit) => (
          <div key={habit.id} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-[#ccc3d8]">{habit.name}</span>
              <span className="font-mono text-xs text-[#ffb95f]">
                {habit.current_streak} day streak
              </span>
            </div>
            <div className="h-2 w-full bg-[#2d3449] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#d2bbff] rounded-full transition-all duration-500"
                style={{ width: `${habit.completion_rate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function GoalsSection({ goals }: { goals: Goal[] }) {
  const BAR_COLORS = ["bg-[#d2bbff]", "bg-[#ffb95f]", "bg-cyan-400", "bg-emerald-400"];

  return (
    <ReportSection
      icon={<Target className="h-5 w-5 text-[#d2bbff]" />}
      title="Goals Progress"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal, index) => (
          <div
            key={goal.id}
            className="p-6 rounded-xl bg-[#2d3449]/30 border border-[#4a4455]/10"
          >
            <div className="flex justify-between mb-4">
              <span className="text-xs font-mono uppercase text-[#ccc3d8]">
                {goal.title}
              </span>
              <span className="text-lg font-bold text-white">{goal.progress}%</span>
            </div>
            <div className="overflow-hidden h-1.5 mb-4 rounded bg-[#2d3449]">
              <div
                className={`h-full ${BAR_COLORS[index % BAR_COLORS.length]} transition-all duration-500`}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
            <p className="text-xs text-[#ccc3d8]">{goal.description}</p>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function FinanceSection({ finance }: { finance: FinanceSummary }) {
  const totalIncome = finance.total_income ?? finance.income ?? 0;
  const totalExpenses = finance.total_expenses ?? finance.expenses ?? 0;
  const savings = finance.savings ?? 0;
  const savingsPercent = totalIncome > 0
    ? Math.round((savings / totalIncome) * 100)
    : 0;

  // Normalize categories
  const topCategories: { name: string; percent: number }[] = finance.top_categories ?? [];
  if (topCategories.length === 0 && finance.by_category) {
    const entries = Object.entries(finance.by_category);
    const total = entries.reduce((s, [, v]) => s + v, 0);
    entries.sort((a, b) => b[1] - a[1]);
    for (const [name, amount] of entries.slice(0, 5)) {
      topCategories.push({ name, percent: total > 0 ? Math.round((amount / total) * 100) : 0 });
    }
  }

  return (
    <ReportSection
      icon={<Wallet className="h-5 w-5 text-[#d2bbff]" />}
      title="Finance Overview"
    >
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#2d3449]/30 border border-[#4a4455]/10">
              <p className="text-[10px] font-mono uppercase text-[#ccc3d8] mb-1">Income</p>
              <p className="text-lg font-bold text-emerald-400">
                Rs {totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#2d3449]/30 border border-[#4a4455]/10">
              <p className="text-[10px] font-mono uppercase text-[#ccc3d8] mb-1">Expenses</p>
              <p className="text-lg font-bold text-[#ffb4ab]">
                Rs {totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#2d3449]/30 border border-[#4a4455]/10">
              <p className="text-[10px] font-mono uppercase text-[#ccc3d8] mb-1">Saved</p>
              <p className="text-lg font-bold text-[#d2bbff]">
                {savingsPercent}%
              </p>
            </div>
          </div>
        </div>
        {topCategories.length > 0 && (
          <div className="flex-1 w-full space-y-4">
            <p className="text-xs font-mono uppercase text-[#ccc3d8] mb-2">Top Categories</p>
            <div className="space-y-3">
              {topCategories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <span className="text-[#dae2fd]">{cat.name}</span>
                  <span className="font-bold text-white">{cat.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ReportSection>
  );
}

function HealthSection({ health }: { health: HealthTrends }) {
  const trends = [
    { label: "Sleep", value: health.sleep.average, change: health.sleep.change, isPositive: health.sleep.is_positive },
    { label: "Exercise", value: health.exercise.average, change: health.exercise.change, isPositive: health.exercise.is_positive },
    { label: "Weight", value: health.weight.current, change: health.weight.change, isPositive: health.weight.is_positive },
  ];

  return (
    <ReportSection
      icon={<Activity className="h-5 w-5 text-[#d2bbff]" />}
      title="Health Trends"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {trends.map((trend) => (
          <div key={trend.label} className="space-y-2">
            <p className="text-[10px] font-mono uppercase text-[#ccc3d8]">{trend.label}</p>
            <p className="text-2xl font-bold text-white">
              {trend.value}{" "}
              <span className={`text-xs font-normal ${trend.isPositive ? "text-emerald-400" : "text-[#ffb4ab]"}`}>
                {trend.change}
              </span>
            </p>
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

// --- Page ---

export default function WeeklyReportPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [habits, goals, finance, health, aiReport] = await Promise.allSettled([
        api.get<Habit[]>("/api/v1/life/habits"),
        api.get<Goal[]>("/api/v1/life/goals?status=active"),
        api.get<FinanceSummary>("/api/v1/life/finance/summary"),
        api.get<HealthTrends>("/api/v1/life/health/trends"),
        api.get<{ ai_insights: string }>("/api/v1/reports/weekly"),
      ]);

      setReportData({
        habits: habits.status === "fulfilled" ? habits.value : [],
        goals: goals.status === "fulfilled" ? goals.value : [],
        finance: finance.status === "fulfilled" ? finance.value : null,
        health: health.status === "fulfilled" ? health.value : null,
        aiInsights: aiReport.status === "fulfilled" ? aiReport.value.ai_insights : null,
      });
    } catch {
      toast.error("Failed to load report data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  if (isLoading) return <LoadingState />;

  const isAllEmpty =
    reportData !== null &&
    reportData.habits.length === 0 &&
    reportData.goals.length === 0 &&
    reportData.finance === null &&
    reportData.health === null;

  if (!reportData || isAllEmpty) return <EmptyState />;

  const handleExport = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  const dateRange = `${formatDate(weekAgo)} -- ${formatDate(today)}, ${today.getFullYear()}`;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b1326]">
      <div className="pt-12 pb-20 px-4 max-w-[700px] mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-white tracking-tight mb-2">
            Your Week in Review
          </h1>
          <div className="font-mono text-sm tracking-widest text-[#ccc3d8] uppercase mb-8">
            {dateRange}
          </div>
          <div className="flex items-center gap-4 px-5 py-2.5 rounded-full bg-[#131b2e] border border-[#4a4455]/10 shadow-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#d2bbff] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono uppercase tracking-tighter text-[#d2bbff]">
                Intelligence Engine
              </p>
              <p className="text-sm font-medium text-[#dae2fd]">Generated by ATHENA</p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          {/* Highlights — auto-generated from data */}
          {(reportData.habits.length > 0 || reportData.goals.length > 0) && (
            <ReportSection
              icon={<Star className="h-5 w-5 text-[#ffb95f] fill-current" />}
              title="Highlights"
              className="shadow-[0_20px_40px_-12px_rgba(124,58,237,0.08)]"
            >
              <HighlightsList data={reportData} />
            </ReportSection>
          )}

          {/* AI-Generated Insights */}
          {reportData.aiInsights && (
            <ReportSection
              icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
              title="AI Insights"
              className="shadow-[0_20px_40px_-12px_rgba(16,185,129,0.08)]"
            >
              <div className="prose prose-invert prose-sm max-w-none text-[#dae2fd] leading-relaxed whitespace-pre-wrap">
                {reportData.aiInsights}
              </div>
            </ReportSection>
          )}

          {reportData.habits.length > 0 && <HabitsSection habits={reportData.habits} />}
          {reportData.goals.length > 0 && <GoalsSection goals={reportData.goals} />}
          {reportData.finance && <FinanceSection finance={reportData.finance} />}
          {reportData.health && <HealthSection health={reportData.health} />}

          {/* Nudges */}
          <section className="p-8 rounded-xl bg-[#ee9800]/5 border border-[#ee9800]/20 shadow-[0_0_50px_rgba(255,185,95,0.03)]">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-5 w-5 text-[#ffb95f] fill-current" />
              <h2 className="text-xl font-headline font-semibold text-[#ffb95f] uppercase tracking-wider">
                Athena Nudges
              </h2>
            </div>
            <NudgesList data={reportData} />
          </section>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <button
              onClick={handleExport}
              className="flex-1 py-4 px-6 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#d2bbff] text-white font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              data-testid="export-pdf-btn"
            >
              <FileDown className="h-5 w-5" />
              Export PDF
            </button>
            <button
              onClick={handleShare}
              className="flex-1 py-4 px-6 rounded-lg border border-[#d2bbff] text-[#d2bbff] font-bold hover:bg-[#d2bbff]/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              data-testid="share-report-btn"
            >
              <Share2 className="h-5 w-5" />
              Share Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper components ---

function HighlightsList({ data }: { data: ReportData }) {
  const highlights: string[] = [];

  if (data.habits?.length > 0) {
    const bestHabit = [...data.habits].sort((a, b) => (b.current_streak ?? 0) - (a.current_streak ?? 0))[0];
    if (bestHabit) {
      highlights.push(`Best streak: ${bestHabit.name} at ${bestHabit.current_streak ?? 0} days.`);
    }
  }

  if (data.goals?.length > 0) {
    const topGoal = [...data.goals].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];
    if (topGoal) {
      highlights.push(`${topGoal.title} is at ${topGoal.progress ?? 0}% progress.`);
    }
  }

  if (data.finance?.savings && data.finance.savings > 0) {
    highlights.push(`Saved Rs ${data.finance.savings.toLocaleString()} this week.`);
  }

  if (data.health?.sleep?.is_positive) {
    highlights.push(`Sleep quality improved by ${data.health.sleep.change}.`);
  }

  if (highlights.length === 0) {
    highlights.push("Keep tracking to see your highlights here.");
  }

  return (
    <ul className="space-y-4">
      {highlights.map((item) => (
        <li key={item} className="flex items-start gap-4">
          <CheckCircle className="h-5 w-5 text-emerald-400 mt-0.5 fill-current" />
          <span className="text-[#dae2fd]">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function NudgesList({ data }: { data: ReportData }) {
  const nudges: { text: string; isPrimary: boolean }[] = [];

  const lowHabits = (data.habits ?? []).filter((h) => (h.completion_rate ?? 100) < 50);
  if (lowHabits.length > 0) {
    nudges.push({
      text: `${lowHabits[0].name} needs attention — only ${lowHabits[0].completion_rate ?? 0}% completion`,
      isPrimary: true,
    });
  }

  const slowGoals = (data.goals ?? []).filter((g) => (g.progress ?? 0) < 30);
  if (slowGoals.length > 0) {
    nudges.push({
      text: `Review your "${slowGoals[0].title}" goal — it's falling behind`,
      isPrimary: false,
    });
  }

  if (data.finance?.savings && data.finance.savings < 0) {
    nudges.push({ text: "You overspent this week. Review your budget.", isPrimary: true });
  }

  if (nudges.length === 0) {
    nudges.push({ text: "Great week! Keep up the momentum.", isPrimary: false });
  }

  return (
    <div className="space-y-4">
      {nudges.map((nudge) => (
        <div
          key={nudge.text}
          className="flex items-center justify-between p-4 rounded-lg bg-[#171f33] border border-[#4a4455]/10 hover:bg-[#222a3d] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-2 h-2 rounded-full ${nudge.isPrimary ? "bg-[#ffb95f] animate-pulse" : "bg-[#ffb95f]/50"}`}
            />
            <span className="text-[#dae2fd]">{nudge.text}</span>
          </div>
          <ChevronRight className="h-5 w-5 text-[#ccc3d8] group-hover:translate-x-1 transition-transform" />
        </div>
      ))}
    </div>
  );
}
