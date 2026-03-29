"use client";

import { useState } from "react";
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
  Wallet,
  Heart,
  ArrowUp,
} from "lucide-react";

// --- Constants ---

const TABS = ["Habits", "Goals", "Finance", "Health"] as const;
type Tab = (typeof TABS)[number];

const HEATMAP_LEVELS = [
  "bg-slate-900",
  "bg-emerald-900/40",
  "bg-emerald-700/60",
  "bg-emerald-500",
  "bg-emerald-400",
] as const;

const CHECKLIST_ITEMS = [
  {
    id: "1",
    label: "Morning Meditation",
    duration: "15m",
    points: 12,
    isCompleted: true,
    isActive: false,
  },
  {
    id: "2",
    label: "Deep Work Block",
    duration: "4h",
    points: 8,
    isCompleted: false,
    isActive: true,
  },
  {
    id: "3",
    label: "Hydration Goal",
    duration: "3L",
    points: 20,
    isCompleted: false,
    isActive: false,
  },
] as const;

const GOAL_CARDS = [
  {
    id: "1",
    category: "Finance",
    categoryColor: "bg-amber-500/10 text-amber-500",
    target: "Dec 2024",
    title: "Portfolio Alpha Target",
    percent: 68,
    detail: "$125,000 / $200k",
    gradient: "from-purple-600 to-amber-500",
  },
  {
    id: "2",
    category: "Health",
    categoryColor: "bg-emerald-500/10 text-emerald-500",
    target: "June 2024",
    title: "Peak Cardiovascular State",
    percent: 42,
    detail: "V02 Max: 48 / 55",
    gradient: "from-emerald-600 to-cyan-500",
  },
] as const;

const FINANCE_STATS = [
  { label: "Monthly Income", value: "$12,500", change: 12, isPositive: true, hasBorder: false },
  { label: "Expenditure", value: "$4,200", change: 4, isPositive: false, hasBorder: false },
  { label: "Net Savings", value: "$8,300", change: 8, isPositive: true, hasBorder: true },
] as const;

const HEALTH_METRICS = [
  { label: "Sleep", value: "8.2h", icon: "up" as const },
  { label: "Exercise", value: "45m", icon: "up" as const },
  { label: "RHR", value: "52 bpm", icon: "down" as const },
  { label: "Mood", value: "Calm", icon: "brain" as const },
] as const;

const SPARKLINE_HEIGHTS = ["h-4", "h-6", "h-8", "h-10", "h-12"] as const;

// --- Seed-based deterministic heatmap ---
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

// --- Components ---

function StreakBanner() {
  return (
    <div className="col-span-12 glass-card rounded-2xl p-8 relative overflow-hidden flex items-center justify-between border-l-4 border-l-[#ffb95f]">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-[#ffb95f] mb-1">
          <Flame className="h-5 w-5 fill-current" />
          <span className="font-mono text-sm uppercase tracking-widest">Consistency Engine</span>
        </div>
        <h3 className="text-3xl font-[family-name:'Space_Grotesk'] text-white">
          Current streak: <span className="text-[#ffb95f]">12 days</span>
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          You are in the top 5% of ATHENA users this week.
        </p>
      </div>
      <div className="hidden lg:flex items-end gap-1 h-12">
        {SPARKLINE_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className={`w-1 rounded-full ${i < 2 ? "bg-slate-800" : "bg-[#ffb95f]"} ${h}`}
          />
        ))}
      </div>
    </div>
  );
}

function DailyChecklist() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-[family-name:'Space_Grotesk'] text-xl text-white">Daily Checklist</h4>
        <span className="text-xs font-mono text-slate-500 uppercase">April 24, 2024</span>
      </div>
      <div className="space-y-4">
        {CHECKLIST_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-4 group cursor-pointer p-3 rounded-xl transition-all ${
              item.isActive
                ? "bg-purple-500/5 border border-purple-500/10 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                : "hover:bg-white/5"
            }`}
          >
            <div
              className={`w-6 h-6 rounded flex items-center justify-center ${
                item.isCompleted
                  ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                  : item.isActive
                    ? "border border-purple-500/40 text-purple-400 group-hover:bg-purple-500/20"
                    : "border border-slate-700 text-slate-400 group-hover:border-purple-500"
              }`}
            >
              {item.isCompleted && <Check className="h-3 w-3" />}
            </div>
            <div className="flex-1">
              <span
                className={`font-medium ${item.isCompleted ? "text-slate-500 line-through" : item.isActive ? "text-white" : "text-slate-300"}`}
              >
                {item.label}
              </span>
              <span
                className={`ml-3 text-[10px] font-mono px-2 py-0.5 rounded ${
                  item.isActive
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-slate-500 bg-slate-900"
                }`}
              >
                {item.duration}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 text-xs ${item.isActive ? "text-purple-400" : item.isCompleted ? "text-slate-600" : "text-slate-500"}`}
            >
              <Zap className={`h-3 w-3 ${item.isActive ? "fill-current" : ""}`} />
              {item.points}
            </div>
          </div>
        ))}
      </div>
      <button className="mt-8 w-full py-2 border border-dashed border-slate-700 rounded-lg text-slate-500 text-xs font-mono hover:border-purple-500 hover:text-purple-400 transition-all">
        + ADD CUSTOM TASK
      </button>
    </div>
  );
}

function ActivityHeatmap() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h4 className="font-[family-name:'Space_Grotesk'] text-lg text-white mb-4">
        Activity Velocity
      </h4>
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
    <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[#171f33] to-purple-900/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#ffb95f] flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-[#2a1700]" />
        </div>
        <span className="font-mono text-xs font-bold text-[#ffb95f] uppercase tracking-tight">
          Athena Pulse
        </span>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed italic">
        &quot;You are 24% more likely to complete &apos;Deep Work&apos; when &apos;Morning
        Meditation&apos; is finished before 08:30. Optimal window detected.&quot;
      </p>
    </div>
  );
}

function GoalCards() {
  return (
    <>
      <div className="col-span-12 mt-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h3 className="font-[family-name:'Space_Grotesk'] text-2xl text-white">
            Active Objectives
          </h3>
          <button className="text-[#d2bbff] text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
            Manage All <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {GOAL_CARDS.map((goal) => (
        <div
          key={goal.id}
          className="col-span-12 md:col-span-6 glass-card rounded-2xl p-6 flex flex-col justify-between h-48 group hover:border-purple-500/30 transition-all"
        >
          <div>
            <div className="flex justify-between items-start">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-tighter ${goal.categoryColor}`}
              >
                {goal.category}
              </span>
              <span className="text-slate-500 text-xs font-mono">Target: {goal.target}</span>
            </div>
            <h4 className="text-xl font-[family-name:'Space_Grotesk'] text-white mt-3">
              {goal.title}
            </h4>
          </div>
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-2xl font-mono text-white">
                {goal.percent}
                <span className="text-slate-500 text-sm">%</span>
              </span>
              <span className="text-slate-400 text-xs">{goal.detail}</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
              <div
                className={`bg-gradient-to-r ${goal.gradient} h-full`}
                style={{ width: `${goal.percent}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function FinanceSummary() {
  return (
    <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {FINANCE_STATS.map((stat) => (
        <div
          key={stat.label}
          className={`glass-card rounded-2xl p-6 ${stat.hasBorder ? "border-b-2 border-[#d2bbff]" : ""}`}
        >
          <div className="flex justify-between items-start text-slate-500 mb-2">
            <span className="text-xs font-mono uppercase">{stat.label}</span>
            <span
              className={`text-xs flex items-center ${stat.isPositive ? "text-emerald-400" : "text-red-400"}`}
            >
              <ArrowUp className="h-3 w-3" /> {stat.change}%
            </span>
          </div>
          <p className="text-3xl font-[family-name:'Space_Grotesk'] text-white">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function HealthMetrics() {
  return (
    <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {HEALTH_METRICS.map((metric) => (
        <div key={metric.label} className="glass-card p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">{metric.label}</p>
            <p className="text-xl font-[family-name:'Space_Grotesk'] text-white">{metric.value}</p>
          </div>
          {metric.icon === "up" && <TrendingUp className="h-5 w-5 text-emerald-400" />}
          {metric.icon === "down" && <TrendingDown className="h-5 w-5 text-emerald-400" />}
          {metric.icon === "brain" && <Brain className="h-5 w-5 text-purple-400" />}
        </div>
      ))}
    </div>
  );
}

// --- Page ---

export default function LifeOSDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Habits");

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b1326]">
      {/* Top Tab Bar */}
      <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-xl shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)]">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="font-[family-name:'Space_Grotesk'] tracking-widest text-white uppercase text-xl font-light">
              ATHENA AI
            </span>
            <nav className="hidden md:flex gap-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-[family-name:'Space_Grotesk'] text-sm tracking-tight pb-1 transition-colors ${
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
              <h2 className="text-4xl font-light font-[family-name:'Space_Grotesk'] tracking-tight text-white">
                Focus: <span className="text-[#d2bbff]">{activeTab}</span>
              </h2>
              <p className="text-slate-400 mt-2">
                Synchronizing performance data for your daily ritual.
              </p>
            </div>
            <div className="glass-card px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#ffb95f] animate-pulse" />
              <span className="font-mono text-xs text-[#ffb95f]">AI OPTIMIZATION ACTIVE</span>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-12 gap-6">
            <StreakBanner />

            {/* Left Column */}
            <div className="col-span-12 lg:col-span-7 space-y-6">
              <DailyChecklist />
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-5 space-y-6">
              <ActivityHeatmap />
              <AiInsight />
            </div>

            <GoalCards />
            <FinanceSummary />
            <HealthMetrics />
          </div>
        </div>
      </div>

      {/* Background glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-amber-500/5 blur-[100px] rounded-full -z-10 pointer-events-none" />
    </div>
  );
}
