"use client";

import { useState } from "react";
import { Search, Sparkles, Trash2 } from "lucide-react";

// --- Types ---

type MemoryType = "all" | "fact" | "preference" | "event" | "relationship";

interface MemoryItem {
  id: string;
  type: "fact" | "preference" | "event";
  content: string;
  importance: number;
  learnedDate: string;
}

// --- Constants ---

const FILTER_TABS: { label: string; value: MemoryType }[] = [
  { label: "All", value: "all" },
  { label: "Facts", value: "fact" },
  { label: "Preferences", value: "preference" },
  { label: "Events", value: "event" },
  { label: "Relationships", value: "relationship" },
];

const TYPE_STYLES: Record<string, { bg: string; text: string; border: string; barColor: string }> = {
  preference: {
    bg: "bg-[#ee9800]/20",
    text: "text-[#ffb95f]",
    border: "border-[#ffb95f]/20",
    barColor: "bg-[#ffb95f]",
  },
  event: {
    bg: "bg-[#646769]/20",
    text: "text-[#c4c7c9]",
    border: "border-[#c4c7c9]/20",
    barColor: "bg-[#c4c7c9]",
  },
  fact: {
    bg: "bg-[#7c3aed]/20",
    text: "text-[#d2bbff]",
    border: "border-[#d2bbff]/20",
    barColor: "bg-[#d2bbff]",
  },
};

const MOCK_MEMORIES: MemoryItem[] = [
  {
    id: "1",
    type: "preference",
    content:
      "User prefers dark mode for all interfaces and cinematic high-contrast aesthetics.",
    importance: 0.9,
    learnedDate: "May 12, 2024",
  },
  {
    id: "2",
    type: "event",
    content:
      "User has a strategic review meeting with the CEO on Friday at 2 PM to discuss AI integration.",
    importance: 0.75,
    learnedDate: "May 14, 2024",
  },
  {
    id: "3",
    type: "fact",
    content:
      "User is a Senior UI Architect with expertise in generative design systems and spatial computing.",
    importance: 0.95,
    learnedDate: "May 10, 2024",
  },
  {
    id: "4",
    type: "fact",
    content:
      "User's primary workstation is located in the London HQ, 4th floor innovation lab.",
    importance: 0.4,
    learnedDate: "May 15, 2024",
  },
];

const SUMMARY_STATS = { facts: 42, preferences: 18, events: 12 };

// --- Components ---

function SummaryCard() {
  return (
    <section className="bg-[#171f33]/60 backdrop-blur-md rounded-xl p-6 border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#d2bbff]/10 blur-3xl -mr-16 -mt-16" />
      <div className="flex items-center gap-5 relative z-10">
        <div className="p-3 bg-[#7c3aed]/20 rounded-lg">
          <Sparkles className="h-8 w-8 text-[#d2bbff]" />
        </div>
        <div>
          <p className="text-[#dae2fd] font-[family-name:'Space_Grotesk'] text-lg font-medium leading-snug">
            ATHENA knows{" "}
            <span className="text-[#d2bbff] font-bold">{SUMMARY_STATS.facts} facts</span>,{" "}
            <span className="text-[#ffb95f] font-bold">
              {SUMMARY_STATS.preferences} preferences
            </span>
            , and{" "}
            <span className="text-[#c4c7c9] font-bold">{SUMMARY_STATS.events} events</span>{" "}
            about you.
          </p>
          <p className="text-[#ccc3d8] text-sm mt-1">
            Neural sync integrity is currently at 98.4%.
          </p>
        </div>
      </div>
    </section>
  );
}

function MemoryCard({ memory }: { memory: MemoryItem }) {
  const style = TYPE_STYLES[memory.type];

  return (
    <div className="group bg-[#171f33] hover:bg-[#222a3d] transition-all rounded-xl p-5 border border-white/5 relative">
      <div className="flex justify-between items-start mb-3">
        <span
          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}
        >
          {memory.type}
        </span>
        <button className="opacity-0 group-hover:opacity-100 p-1.5 text-[#ffb4ab]/60 hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-lg transition-all">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <p className="text-[#dae2fd] leading-relaxed mb-4">{memory.content}</p>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-[#4a4455] font-mono uppercase">Importance</span>
            <div className="w-24 h-1 bg-[#060e20] rounded-full overflow-hidden">
              <div
                className={`h-full ${style.barColor}`}
                style={{
                  width: `${memory.importance * 100}%`,
                  boxShadow:
                    memory.importance > 0.8
                      ? `0 0 8px ${memory.type === "fact" ? "rgba(210,187,255,0.4)" : "rgba(255,185,95,0.4)"}`
                      : "none",
                }}
              />
            </div>
          </div>
          <span className={`font-mono text-xs ${style.text} mt-3`}>
            {memory.importance}
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#4a4455] mt-3">
          Learned on {memory.learnedDate}
        </span>
      </div>
    </div>
  );
}

// --- Page ---

export default function MemoryPage() {
  const [activeFilter, setActiveFilter] = useState<MemoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMemories = MOCK_MEMORIES.filter((memory) => {
    const matchesFilter = activeFilter === "all" || memory.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      memory.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#0F172A]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-xl flex justify-between items-center w-full px-10 py-5 shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)]">
        <div className="flex items-center gap-4">
          <h1 className="font-[family-name:'Space_Grotesk'] text-2xl font-bold bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">
            ATHENA&apos;s Memory
          </h1>
        </div>
        <div className="flex-1 max-w-md mx-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#958da1] group-focus-within:text-[#d2bbff] transition-colors" />
            <input
              className="w-full bg-[#060e20] border-none rounded-full py-2.5 pl-12 pr-4 text-[#dae2fd] placeholder:text-[#958da1] focus:ring-1 focus:ring-[#d2bbff]/40 transition-all outline-none"
              placeholder="Search memories..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="memory-search"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-8">
        <div className="max-w-[700px] mx-auto space-y-8">
          {/* Filter Chips */}
          <section className="flex flex-wrap gap-2 justify-center">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === tab.value
                    ? "bg-[#7c3aed] text-white"
                    : "bg-[#171f33] hover:bg-[#222a3d] text-[#ccc3d8]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </section>

          <SummaryCard />

          {/* Memory List */}
          <section className="space-y-4">
            {filteredMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
            {filteredMemories.length === 0 && (
              <p className="text-center text-slate-500 py-12">
                No memories match your search.
              </p>
            )}
          </section>

          {/* Status Footer */}
          <div className="pt-8 pb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#131b2e] border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#d2bbff] animate-pulse" />
              <span className="text-[10px] font-mono text-[#4a4455] uppercase tracking-widest">
                ATHENA Memory Sync: Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Background glow */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#d2bbff]/5 blur-[120px] rounded-full -mb-64 -mr-64 pointer-events-none" />
    </div>
  );
}
