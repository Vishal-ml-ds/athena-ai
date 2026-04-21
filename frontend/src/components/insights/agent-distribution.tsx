"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";

// --- Types ---

interface AgentDistEntry {
  agent: string;
  count: number;
}

// --- Constants ---

const AGENT_COLORS: Record<string, string> = {
  researcher: "#60a5fa",
  coder: "#22d3ee",
  general: "#d2bbff",
  supervisor: "#d2bbff",
  browser: "#fb923c",
  scheduler: "#34d399",
  finance: "#a78bfa",
  "life coach": "#fbbf24",
  unknown: "#6b7280",
};

const DEFAULT_COLOR = "#6b7280";

interface AgentDistributionProps {
  readonly days?: number;
}

// --- Component ---

export function AgentDistribution({ days = 30 }: AgentDistributionProps) {
  const [data, setData] = useState<AgentDistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get<AgentDistEntry[]>(`/api/v1/analytics/agent-distribution?days=${days}`)
      .then((d) => setData(d))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [days]);

  const total = data.reduce((sum, d) => sum + d.count, 0);

  // Compute percentages
  const entries = data.map((d) => ({
    ...d,
    percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
    color: AGENT_COLORS[d.agent.toLowerCase()] ?? DEFAULT_COLOR,
  }));

  return (
    <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl border border-[#4a4455]/15 p-8 rounded-xl flex flex-col">
      <h3 className="font-headline text-lg font-bold text-[#dae2fd] mb-8">
        Agent Distribution
      </h3>

      {/* Visual ring */}
      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative w-48 h-48 rounded-full border-[16px] border-[#060e20] flex items-center justify-center">
          <div className="absolute inset-[-16px] rounded-full border-[16px] border-l-[#60a5fa] border-t-[#22d3ee] border-r-[#34d399] border-b-[#fbbf24] opacity-80 rotate-45" />
          <div className="text-center">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
            ) : (
              <>
                <span className="block text-3xl font-bold font-headline text-white">
                  {entries.length}
                </span>
                <span className="text-[10px] uppercase font-mono text-[#958da1] tracking-widest">
                  Active Units
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bar breakdown */}
      {isLoading ? (
        <div className="space-y-3 mt-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-[#131b2e] rounded" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-[#958da1] text-sm mt-6 font-mono">
          No agent data yet. Start chatting to see distribution.
        </p>
      ) : (
        <div className="space-y-3 mt-6">
          {entries.map((agent) => (
            <div key={agent.agent} className="space-y-1">
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="text-[#dae2fd] capitalize">{agent.agent}</span>
                </div>
                <span className="font-mono text-[#958da1]">{agent.percentage}%</span>
              </div>
              <div className="h-1.5 w-full bg-[#060e20] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${agent.percentage}%`,
                    backgroundColor: agent.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
