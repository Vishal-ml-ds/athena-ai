"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, Sparkles, Trash2, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";

/* ─── Types ─── */

type MemoryType = "all" | "fact" | "preference" | "event" | "relationship";

interface MemoryItem {
  id: string;
  memory_type: string;
  content: string;
  importance: number;
  created_at: string;
}

interface MemorySummary {
  total: number;
  by_type: Record<string, number>;
}

/* ─── Constants ─── */

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
    text: "text-athena-secondary",
    border: "border-athena-secondary/20",
    barColor: "bg-athena-secondary",
  },
  event: {
    bg: "bg-[#646769]/20",
    text: "text-[#c4c7c9]",
    border: "border-[#c4c7c9]/20",
    barColor: "bg-[#c4c7c9]",
  },
  fact: {
    bg: "bg-primary-container/20",
    text: "text-athena-primary",
    border: "border-athena-primary/20",
    barColor: "bg-athena-primary",
  },
  relationship: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-400/20",
    barColor: "bg-emerald-400",
  },
};

const DEFAULT_STYLE = TYPE_STYLES.fact;
const DEBOUNCE_MS = 400;

/* ─── Sub-components ─── */

function SummaryCard({ summary }: { summary: MemorySummary | null }) {
  const facts = summary?.by_type?.fact ?? 0;
  const preferences = summary?.by_type?.preference ?? 0;
  const events = summary?.by_type?.event ?? 0;

  return (
    <section className="bg-surface-container/60 backdrop-blur-md rounded-xl p-6 border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-athena-primary/10 blur-3xl -mr-16 -mt-16" />
      <div className="flex items-center gap-5 relative z-10">
        <div className="p-3 bg-primary-container/20 rounded-lg">
          <Sparkles className="h-8 w-8 text-athena-primary" />
        </div>
        <div>
          <p className="text-on-surface font-headline text-lg font-medium leading-snug">
            ATHENA knows{" "}
            <span className="text-athena-primary font-bold">{facts} facts</span>,{" "}
            <span className="text-athena-secondary font-bold">{preferences} preferences</span>
            , and{" "}
            <span className="text-[#c4c7c9] font-bold">{events} events</span>{" "}
            about you.
          </p>
          <p className="text-on-surface-variant text-sm mt-1">
            {summary ? `${summary.total} total memories synced.` : "Loading memory sync..."}
          </p>
        </div>
      </div>
    </section>
  );
}

function MemoryCard({
  memory,
  onDelete,
}: {
  memory: MemoryItem;
  onDelete: (id: string) => void;
}) {
  const style = TYPE_STYLES[memory.memory_type] ?? DEFAULT_STYLE;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    onDelete(memory.id);
  };

  const formattedDate = new Date(memory.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="group bg-surface-container hover:bg-surface-container-high transition-all rounded-xl p-5 border border-white/5 relative">
      <div className="flex justify-between items-start mb-3">
        <span
          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} border ${style.border}`}
        >
          {memory.memory_type}
        </span>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          data-testid={`delete-memory-${memory.id}`}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-[#ffb4ab]/60 hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 rounded-lg transition-all disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
      <p className="text-on-surface leading-relaxed mb-4">{memory.content}</p>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-outline-variant font-mono uppercase">Importance</span>
            <div className="w-24 h-1 bg-surface-container-lowest rounded-full overflow-hidden">
              <div
                className={`h-full ${style.barColor}`}
                style={{
                  width: `${memory.importance * 100}%`,
                  boxShadow:
                    memory.importance > 0.8
                      ? `0 0 8px ${memory.memory_type === "fact" ? "rgba(210,187,255,0.4)" : "rgba(255,185,95,0.4)"}`
                      : "none",
                }}
              />
            </div>
          </div>
          <span className={`font-mono text-xs ${style.text} mt-3`}>
            {memory.importance}
          </span>
        </div>
        <span className="font-mono text-[10px] text-outline-variant mt-3">
          Learned on {formattedDate}
        </span>
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function MemoryPage() {
  const [activeFilter, setActiveFilter] = useState<MemoryType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [summary, setSummary] = useState<MemorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Fetch memories list */
  const fetchMemories = useCallback(async (filter: MemoryType) => {
    setIsLoading(true);
    try {
      const endpoint = filter === "all"
        ? "/api/v1/memories"
        : `/api/v1/memories?memory_type=${filter}`;
      const data = await api.get<{ items: MemoryItem[] } | MemoryItem[]>(endpoint);
      setMemories(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* Fetch summary counts */
  const fetchSummary = useCallback(async () => {
    try {
      /* Build summary from full list */
      const raw = await api.get<{ items: MemoryItem[] } | MemoryItem[]>("/api/v1/memories");
      const data = Array.isArray(raw) ? raw : raw.items ?? [];
      const byType: Record<string, number> = {};
      for (const m of data) {
        byType[m.memory_type] = (byType[m.memory_type] ?? 0) + 1;
      }
      setSummary({ total: data.length, by_type: byType });
    } catch {
      /* Keep existing summary on error */
    }
  }, []);

  /* Search with debounce */
  const searchMemories = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchMemories(activeFilter);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.post<MemoryItem[]>("/api/v1/memories/search", { query });
      setMemories(data);
    } catch {
      setMemories([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, fetchMemories]);

  /* Initial load */
  useEffect(() => {
    fetchMemories("all");
    fetchSummary();
  }, [fetchMemories, fetchSummary]);

  /* Re-fetch on filter change */
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchMemories(activeFilter);
    }
  }, [activeFilter, fetchMemories, searchQuery]);

  /* Debounced search */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchMemories(searchQuery);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery, searchMemories]);

  /* Delete handler */
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/v1/memories/${id}`);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      /* Update summary */
      setSummary((prev) => {
        if (!prev) return prev;
        const deleted = memories.find((m) => m.id === id);
        if (!deleted) return prev;
        const newByType = { ...prev.by_type };
        newByType[deleted.memory_type] = Math.max(0, (newByType[deleted.memory_type] ?? 0) - 1);
        return { total: prev.total - 1, by_type: newByType };
      });
    } catch {
      /* Silently fail — could show toast here */
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-athena-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/60 backdrop-blur-xl flex justify-between items-center w-full px-6 md:px-10 py-5 shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)]">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-2xl font-bold bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">
            ATHENA&apos;s Memory
          </h1>
        </div>
        <div className="flex-1 max-w-md mx-4 md:mx-12">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-outline group-focus-within:text-athena-primary transition-colors" />
            <input
              className="w-full bg-surface-container-lowest border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface placeholder:text-outline focus:ring-1 focus:ring-athena-primary/40 transition-all outline-none"
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
                data-testid={`filter-${tab.value}`}
                className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === tab.value
                    ? "bg-primary-container text-white"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </section>

          <SummaryCard summary={summary} />

          {/* Memory List */}
          <section className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
              </div>
            ) : memories.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">
                  {searchQuery
                    ? "No memories match your search."
                    : "No memories yet. Start chatting and ATHENA will remember."}
                </p>
              </div>
            ) : (
              memories.map((memory) => (
                <MemoryCard key={memory.id} memory={memory} onDelete={handleDelete} />
              ))
            )}
          </section>

          {/* Status Footer */}
          <div className="pt-8 pb-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-white/5">
              <span className="w-2 h-2 rounded-full bg-athena-primary animate-pulse" />
              <span className="text-[10px] font-mono text-outline-variant uppercase tracking-widest">
                ATHENA Memory Sync: Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Background glow */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-athena-primary/5 blur-[120px] rounded-full -mb-64 -mr-64 pointer-events-none" />
    </div>
  );
}
