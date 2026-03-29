"use client";

import { Info } from "lucide-react";
import { InsightStatCards } from "@/components/insights/insight-stat-cards";
import { AgentDistribution } from "@/components/insights/agent-distribution";
import { ActivityHeatmap } from "@/components/insights/activity-heatmap";
import { ResponseTimeTrend } from "@/components/insights/response-time-trend";
import { TopTopics } from "@/components/insights/top-topics";

// --- Constants ---

const TIME_FILTERS = ["7D", "30D", "90D"] as const;
const ACTIVE_FILTER_INDEX = 0;

// --- Page ---

export default function ConversationInsightsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0b1326] relative">
      {/* Decorative gradient */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#d2bbff]/5 rounded-full blur-[120px] -z-0 pointer-events-none" />

      <section className="relative z-10 p-8 space-y-8">
        {/* Real-time note */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#131b2e] rounded-xl border border-[#4a4455]/10">
          <Info className="h-4 w-4 text-[#d2bbff] shrink-0" />
          <p className="text-sm text-slate-400">
            Analytics update in real-time as you use ATHENA. Start chatting to see your data here.
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-headline font-bold text-[#dae2fd]">
              Intelligence Analytics
            </h2>
            <p className="text-[#958da1] mt-1">
              Real-time processing and linguistic distribution metrics.
            </p>
          </div>
          <div className="flex bg-[#131b2e] p-1 rounded-xl">
            {TIME_FILTERS.map((filter, index) => (
              <button
                key={filter}
                className={`px-4 py-2 text-xs font-medium font-mono rounded-lg transition-colors ${
                  index === ACTIVE_FILTER_INDEX
                    ? "bg-[#222a3d] text-[#d2bbff]"
                    : "text-[#958da1] hover:text-[#dae2fd]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Top Stats -- wired to real API */}
        <InsightStatCards />

        {/* Main Charts: Distribution + Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <AgentDistribution />
          </div>
          <div className="lg:col-span-3">
            <ActivityHeatmap />
          </div>
        </div>

        {/* Bottom Row: Response Time + Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponseTimeTrend />
          <TopTopics />
        </div>
      </section>
    </div>
  );
}
