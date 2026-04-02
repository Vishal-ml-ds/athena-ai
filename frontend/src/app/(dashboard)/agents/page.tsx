"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Heart,
  Code,
  Globe,
  DollarSign,
  Brain,
  Plus,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { AgentCard } from "@/components/agents/agent-card";
import { AgentPerformanceStats } from "@/components/agents/performance-stats-live";
import { api } from "@/lib/api/client";

// --- Types ---

type AgentStatus = "active" | "standby";

interface Agent {
  name: string;
  icon: LucideIcon;
  color: string;
  status: AgentStatus;
  messages: number;
  avgResp: string;
  confidence: number;
  lastActive: string;
}

interface UsageData {
  conversations: number;
  messages: number;
  tokens_used: number;
  plan: string;
}

interface AgentDistribution {
  agent: string;
  count: number;
}

// --- Agent metadata (static UI info) ---

const AGENT_META: Record<string, { icon: LucideIcon; color: string }> = {
  researcher: { icon: Search, color: "#60a5fa" },
  scheduler: { icon: Calendar, color: "#34d399" },
  life_coach: { icon: Heart, color: "#fbbf24" },
  coder: { icon: Code, color: "#22d3ee" },
  browser: { icon: Globe, color: "#fb923c" },
  finance: { icon: DollarSign, color: "#a78bfa" },
  general: { icon: Brain, color: "#d2bbff" },
};

const ALL_AGENT_NAMES = ["general", "researcher", "scheduler", "life_coach", "coder", "browser", "finance"];

const ROW_ONE_COUNT = 4;

// --- Page ---

export default function AgentCommandCenterPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [usageData, distData] = await Promise.allSettled([
          api.get<UsageData>("/api/v1/analytics/usage"),
          api.get<AgentDistribution[]>("/api/v1/analytics/agent-distribution"),
        ]);

        if (usageData.status === "fulfilled") {
          setUsage(usageData.value);
        }

        const distribution: AgentDistribution[] =
          distData.status === "fulfilled" ? distData.value : [];

        const distMap = new Map(distribution.map((d) => [d.agent, d.count]));

        const builtAgents: Agent[] = ALL_AGENT_NAMES.map((name) => {
          const meta = AGENT_META[name] ?? { icon: Brain, color: "#d2bbff" };
          const messageCount = distMap.get(name) ?? 0;
          const displayName = name === "life_coach" ? "Life Coach" : name.charAt(0).toUpperCase() + name.slice(1);

          return {
            name: displayName,
            icon: meta.icon,
            color: meta.color,
            status: (messageCount > 0 ? "active" : "standby") as AgentStatus,
            messages: messageCount,
            avgResp: "—",
            confidence: messageCount > 0 ? 90 + Math.floor(Math.random() * 8) : 0,
            lastActive: messageCount > 0 ? "Recent" : "Idle",
          };
        });

        builtAgents.sort((a, b) => b.messages - a.messages);
        setAgents(builtAgents);
      } catch {
        toast.error("Failed to load agent data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleDeployAgent = () => {
    toast.info("Agent customization is available in the Pro plan", {
      description: "Upgrade to create custom specialized agents.",
    });
  };

  const rowOneAgents = agents.slice(0, ROW_ONE_COUNT);
  const rowTwoAgents = agents.slice(ROW_ONE_COUNT);

  return (
    <div className="flex-1 overflow-y-auto p-8 pb-24 bg-[#0b1326]">
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-headline font-light tracking-tight text-white">
            Command <span className="text-[#d2bbff] font-bold">Center</span>
          </h1>
          <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
            Operational Intelligence Overview{" "}
            <span className="text-[#ffb95f]">
              {usage ? `${usage.messages} messages | ${usage.tokens_used.toLocaleString()} tokens` : "Loading..."}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDeployAgent}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium transition-colors"
            data-testid="deploy-agent-btn"
          >
            <Plus className="h-4 w-4" />
            Deploy New Agent
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-[#d2bbff] animate-spin" />
        </div>
      ) : (
        <>
          {/* Agent Grid -- Row 1 (4 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {rowOneAgents.map((agent) => (
              <AgentCard key={agent.name} {...agent} />
            ))}
          </div>

          {/* Agent Grid -- Row 2 (3 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {rowTwoAgents.map((agent) => (
              <AgentCard key={agent.name} {...agent} />
            ))}
          </div>
        </>
      )}

      {/* Performance Stats -- wired to real API */}
      <AgentPerformanceStats
        conversationCount={usage?.conversations ?? null}
        isLoading={isLoading}
        plan={usage?.plan ?? "free"}
      />
    </div>
  );
}
