"use client";

import {
  Search,
  Calendar,
  Heart,
  Code,
  Globe,
  DollarSign,
  Brain,
  type LucideIcon,
} from "lucide-react";
import { AgentCard } from "@/components/agents/agent-card";
import { PerformanceStats } from "@/components/agents/performance-stats";

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

// --- Constants ---

const AGENTS: Agent[] = [
  { name: "Researcher", icon: Search, color: "#60a5fa", status: "active", messages: 1204, avgResp: "1.8s", confidence: 92, lastActive: "2 min ago" },
  { name: "Scheduler", icon: Calendar, color: "#34d399", status: "active", messages: 843, avgResp: "0.7s", confidence: 96, lastActive: "5 min ago" },
  { name: "Life Coach", icon: Heart, color: "#fbbf24", status: "standby", messages: 315, avgResp: "1.2s", confidence: 89, lastActive: "1 hr ago" },
  { name: "Coder", icon: Code, color: "#22d3ee", status: "active", messages: 2489, avgResp: "3.4s", confidence: 94, lastActive: "1 min ago" },
  { name: "Browser", icon: Globe, color: "#fb923c", status: "active", messages: 1390, avgResp: "1.9s", confidence: 87, lastActive: "10 min ago" },
  { name: "Finance", icon: DollarSign, color: "#a78bfa", status: "standby", messages: 420, avgResp: "0.9s", confidence: 91, lastActive: "30 min ago" },
  { name: "General", icon: Brain, color: "#d2bbff", status: "active", messages: 5210, avgResp: "0.2s", confidence: 98, lastActive: "now" },
];

const ROW_ONE_COUNT = 4;

// --- Page ---

export default function AgentCommandCenterPage() {
  const rowOneAgents = AGENTS.slice(0, ROW_ONE_COUNT);
  const rowTwoAgents = AGENTS.slice(ROW_ONE_COUNT);

  return (
    <div className="flex-1 overflow-y-auto p-8 pb-24 bg-[#0b1326]">
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-[family-name:'Space_Grotesk'] font-light tracking-tight text-white">
            Command <span className="text-[#d2bbff] font-bold">Center</span>
          </h1>
          <p className="text-slate-400 font-mono text-xs mt-2 uppercase tracking-widest">
            Operational Intelligence Overview{" "}
            <span className="text-[#ffb95f]">All Systems Nominal</span>
          </p>
        </div>
        <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl px-4 py-2 rounded-xl flex flex-col items-end">
          <span className="text-[10px] font-mono text-slate-500 uppercase">System Uptime</span>
          <span className="text-white font-mono font-bold">99.98%</span>
        </div>
      </header>

      {/* Agent Grid — Row 1 (4 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {rowOneAgents.map((agent) => (
          <AgentCard key={agent.name} {...agent} />
        ))}
      </div>

      {/* Agent Grid — Row 2 (3 cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {rowTwoAgents.map((agent) => (
          <AgentCard key={agent.name} {...agent} />
        ))}
      </div>

      {/* Performance Stats */}
      <PerformanceStats />
    </div>
  );
}
