"use client";

import { useState } from "react";
import {
  Globe,
  Check,
  Lock,
  RefreshCw,
  Hand,
  StopCircle,
  Info,
  MousePointer2,
  Eye,
} from "lucide-react";

// --- Types ---

type StepStatus = "completed" | "active" | "pending";

interface TimelineStep {
  id: string;
  label: string;
  time: string;
  status: StepStatus;
}

// --- Constants ---

const TIMELINE_STEPS: TimelineStep[] = [
  { id: "1", label: "Navigated to amazon.in", time: "10:05 AM", status: "completed" },
  { id: "2", label: "Searched for wireless mouse", time: "10:06 AM", status: "completed" },
  { id: "3", label: "Clicked filters", time: "10:07 AM", status: "active" },
  { id: "4", label: "Applying price filter", time: "Pending", status: "pending" },
];

const STATUS_STYLES: Record<StepStatus, { ring: string; inner: React.ReactNode }> = {
  completed: {
    ring: "bg-emerald-500/20 border border-emerald-500/40",
    inner: <Check className="h-3 w-3 text-emerald-400" />,
  },
  active: {
    ring: "bg-[#d2bbff]/20 border border-[#d2bbff]/40 relative",
    inner: (
      <>
        <div className="absolute inset-0 rounded-full bg-[#d2bbff] animate-pulse opacity-20" />
        <div className="w-2 h-2 rounded-full bg-[#d2bbff]" />
      </>
    ),
  },
  pending: {
    ring: "bg-slate-800 border border-slate-700",
    inner: null,
  },
};

const META_STATS = [
  { label: "Frame Rate", value: "60.0 FPS" },
  { label: "Latency", value: "24ms" },
] as const;

// --- Components ---

function TaskInputPanel() {
  return (
    <div className="p-6 border-b border-[#4a4455]/10">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-5 w-5 text-[#d2bbff]" />
        <h1 className="text-xl font-bold font-[family-name:'Space_Grotesk'] tracking-tight text-white">
          Browser Task
        </h1>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 uppercase tracking-widest mb-2">
            Instructions
          </label>
          <textarea
            className="w-full h-32 bg-[#060e20] border-none rounded-xl text-sm focus:ring-1 focus:ring-[#d2bbff]/40 text-[#dae2fd] p-4 resize-none transition-all outline-none"
            placeholder="What should ATHENA do on the web?"
            data-testid="browser-task-input"
          />
        </div>
        <button className="w-full bg-[#7c3aed] hover:bg-[#d2bbff] py-3 rounded-lg text-white font-semibold transition-all shadow-lg shadow-[#7c3aed]/20">
          Execute Task
        </button>
      </div>
    </div>
  );
}

function ActionTimeline() {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-6">
        Automation Stream
      </h3>
      <div className="relative space-y-8">
        {/* Vertical connector line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-700/50" />

        {TIMELINE_STEPS.map((step) => {
          const style = STATUS_STYLES[step.status];
          return (
            <div
              key={step.id}
              className={`relative flex gap-4 items-start ${step.status === "pending" ? "opacity-40" : ""}`}
            >
              <div
                className={`z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.ring}`}
              >
                {step.status === "pending" ? (
                  <span className="text-[10px] font-mono text-slate-400">
                    {String(TIMELINE_STEPS.indexOf(step) + 1).padStart(2, "0")}
                  </span>
                ) : (
                  style.inner
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-sm font-medium ${
                    step.status === "active"
                      ? "text-[#d2bbff] font-semibold"
                      : step.status === "pending"
                        ? "text-slate-400"
                        : "text-slate-100"
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`text-[10px] font-mono ${step.status === "pending" ? "text-slate-600" : "text-slate-500"}`}
                >
                  {step.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrowserViewport() {
  return (
    <div className="flex flex-col h-full bg-[rgba(23,31,51,0.6)] backdrop-blur-xl rounded-2xl border border-[#4a4455]/10 overflow-hidden shadow-2xl">
      {/* URL Bar */}
      <div className="p-4 bg-[#171f33]/40 flex items-center gap-4">
        <div className="flex gap-2 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/40" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
        </div>
        <div className="flex-1 flex items-center bg-[#060e20] px-4 py-2 rounded-lg gap-3">
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-tighter">
              Live
            </span>
          </div>
          <Lock className="h-3 w-3 text-slate-500" />
          <span className="text-slate-300 text-sm font-mono flex-1 truncate">
            https://www.amazon.in/s?k=wireless+mouse
          </span>
          <button className="hover:text-[#d2bbff] transition-colors text-slate-500">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <button className="px-4 py-2 rounded-lg border border-[#d2bbff]/40 text-[#d2bbff] text-xs font-semibold hover:bg-[#d2bbff]/10 transition-all flex items-center gap-2">
          <Hand className="h-3 w-3" />
          Take Control
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative bg-slate-900 min-h-[300px]">
        {/* Placeholder for screenshot */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
          <p className="text-slate-600 font-mono text-sm">Live browser view placeholder</p>
        </div>

        {/* AI Cursor */}
        <div className="absolute top-[40%] left-[60%] flex flex-col items-center pointer-events-none -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 rounded-full border-2 border-[#d2bbff] animate-ping absolute opacity-40" />
          <MousePointer2 className="h-8 w-8 text-[#d2bbff] drop-shadow-lg" />
          <div className="mt-2 bg-[#d2bbff] px-2 py-1 rounded text-[10px] text-[#3f008e] font-bold shadow-xl">
            ATHENA ACTING...
          </div>
        </div>

        {/* Stop button */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <button className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center gap-3 font-bold shadow-2xl shadow-red-900/50 transition-transform active:scale-95">
            <StopCircle className="h-5 w-5" />
            Stop Automation
          </button>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="px-6 py-3 bg-[#171f33]/60 flex justify-between items-center">
        <div className="flex gap-6">
          {META_STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-mono">{stat.label}</span>
              <span className="text-xs text-[#dae2fd] font-mono">{stat.value}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Eye className="h-4 w-4" />
          <span className="text-xs font-mono">Agent: 0x2A...F4</span>
        </div>
      </div>
    </div>
  );
}

// --- Page ---

export default function BrowserAutomationPage() {
  return (
    <div className="flex-1 flex bg-[#0b1326] overflow-hidden">
      {/* Left Panel */}
      <section className="w-[350px] bg-[#1E293B] flex flex-col border-r border-[#4a4455]/10 shrink-0">
        <TaskInputPanel />
        <ActionTimeline />
      </section>

      {/* Right Panel */}
      <section className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
        <BrowserViewport />

        {/* Context Hint */}
        <div className="flex items-center gap-4 px-6 py-4 bg-[#131b2e] rounded-xl border border-[#4a4455]/5">
          <Info className="h-5 w-5 text-[#ffb95f] shrink-0" />
          <p className="text-sm text-slate-400 italic">
            ATHENA is currently identifying the best-selling wireless mice under Rs 2000 with 4+ star
            ratings.
          </p>
        </div>
      </section>
    </div>
  );
}
