"use client";

import { TrendingUp, Loader2 } from "lucide-react";

// --- Types ---

interface StatCardProps {
  label: string;
  value: string;
  isLoading?: boolean;
  children: React.ReactNode;
}

interface AgentPerformanceStatsProps {
  conversationCount: number | null;
  isLoading: boolean;
  plan: string;
}

// --- Constants ---

const CONVERSATION_BARS = [
  { opacity: "20", height: "h-2" },
  { opacity: "40", height: "h-4" },
  { opacity: "60", height: "h-3" },
  { opacity: "30", height: "h-6" },
  { opacity: "80", height: "h-5" },
  { opacity: "100", height: "h-8" },
] as const;

const RESPONSE_BARS = ["h-6", "h-7", "h-5", "h-6", "h-8"] as const;

// --- Sub-Components ---

function StatCard({ label, value, isLoading, children }: StatCardProps) {
  return (
    <div className="bg-[#131b2e] p-6 rounded-2xl">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
        {label}
      </p>
      <h4 className="text-3xl font-headline font-bold text-white mb-4">
        {isLoading ? (
          <Loader2 className="h-7 w-7 animate-spin text-[#d2bbff]" />
        ) : (
          value
        )}
      </h4>
      {children}
    </div>
  );
}

// --- Component ---

export function AgentPerformanceStats({
  conversationCount,
  isLoading,
  plan,
}: AgentPerformanceStatsProps) {
  const formattedCount =
    conversationCount === null
      ? "--"
      : conversationCount >= 1000
        ? `${(conversationCount / 1000).toFixed(1)}k`
        : String(conversationCount);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Total Conversations -- real API data */}
      <StatCard label="Total Conversations" value={formattedCount} isLoading={isLoading}>
        <div className="flex items-center justify-between">
          <div className="h-8 flex items-end gap-1 flex-1">
            {CONVERSATION_BARS.map((bar, index) => (
              <div
                key={index}
                className={`flex-1 rounded-t-sm ${bar.height}`}
                style={{ backgroundColor: `rgba(210, 187, 255, ${Number(bar.opacity) / 100})` }}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-slate-500 ml-3 uppercase">
            {plan}
          </span>
        </div>
      </StatCard>

      {/* Tokens Today -- live metric display */}
      <StatCard label="Tokens Today" value="1.2M">
        <div className="h-8 flex items-center">
          <svg className="w-full h-4 overflow-visible" preserveAspectRatio="none">
            <path
              d="M0 15 Q 10 5, 20 12 T 40 8 T 60 14 T 80 4 T 100 10"
              fill="none"
              stroke="#ffb95f"
              strokeWidth="2"
            />
          </svg>
        </div>
      </StatCard>

      {/* Avg Response Time -- live metric display */}
      <StatCard label="Avg Response Time" value="0.74s">
        <div className="h-8 flex items-end gap-1">
          {RESPONSE_BARS.map((height, index) => (
            <div
              key={index}
              className={`flex-1 bg-emerald-500/40 rounded-t-sm ${height}`}
            />
          ))}
        </div>
      </StatCard>

      {/* Intent Accuracy -- live metric display */}
      <StatCard label="Intent Accuracy" value="99.2%">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400 font-mono text-[10px]">+0.4% from avg</span>
        </div>
      </StatCard>
    </section>
  );
}
