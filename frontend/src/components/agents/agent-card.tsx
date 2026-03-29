"use client";

import { type LucideIcon } from "lucide-react";

// --- Types ---

type AgentStatus = "active" | "standby";

interface AgentCardProps {
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

const STATUS_CONFIG: Record<AgentStatus, { label: string; classes: string }> = {
  active: {
    label: "Active",
    classes: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  },
  standby: {
    label: "Standby",
    classes: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
  },
};

const CONFIDENCE_RING_CIRCUMFERENCE = 100.53; // 2 * PI * 16

// --- Component ---

export function AgentCard({
  name,
  icon: Icon,
  color,
  status,
  messages,
  avgResp,
  confidence,
  lastActive,
}: AgentCardProps) {
  const statusConfig = STATUS_CONFIG[status];
  const dashOffset = CONFIDENCE_RING_CIRCUMFERENCE * ((100 - confidence) / 100);

  return (
    <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden group hover:bg-[#222a3d] transition-all duration-500">
      {/* Glow effect */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl opacity-5"
        style={{ backgroundColor: color }}
      />

      {/* Header: icon + status */}
      <div className="flex justify-between items-start mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border"
          style={{
            backgroundColor: `${color}20`,
            borderColor: `${color}4D`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest ${statusConfig.classes}`}
        >
          {statusConfig.label}
        </span>
      </div>

      {/* Name + last active + confidence ring */}
      <h3 className="text-xl font-[family-name:'Space_Grotesk'] font-bold text-white mb-1">
        {name}
      </h3>
      <div className="flex justify-between items-center mb-4">
        <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
          Last: {lastActive}
        </p>
        <div className="relative w-8 h-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              className="stroke-slate-800"
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="3"
              stroke={color}
              strokeDasharray={CONFIDENCE_RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-mono text-white">
            {confidence}%
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 border-t border-white/5 pt-4">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Messages</span>
          <span className="text-white font-mono">{messages.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Avg Resp</span>
          <span className="text-white font-mono">{avgResp}</span>
        </div>
      </div>
    </div>
  );
}
