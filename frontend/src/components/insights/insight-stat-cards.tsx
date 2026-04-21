"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Star, Search, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";

// --- Types ---

interface UsageData {
  conversations: number;
  messages: number;
  tokens_used: number;
  plan: string;
  days: number;
}

// --- Constants ---

const CONVERSATION_BARS = [
  { opacity: 0.2, height: "h-1/2" },
  { opacity: 0.3, height: "h-2/3" },
  { opacity: 0.4, height: "h-3/4" },
  { opacity: 0.6, height: "h-2/3" },
  { opacity: 0.8, height: "h-full" },
] as const;

const MESSAGE_BARS = [
  { opacity: 0.2, height: "h-4" },
  { opacity: 0.4, height: "h-6" },
  { opacity: 0.2, height: "h-3" },
  { opacity: 1, height: "h-8" },
  { opacity: 0.4, height: "h-5" },
] as const;

// --- Component ---

interface InsightStatCardsProps {
  readonly days?: number;
}

export function InsightStatCards({ days = 30 }: InsightStatCardsProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    async function fetchUsage() {
      try {
        const data = await api.get<UsageData>(`/api/v1/analytics/usage?days=${days}`);
        setUsage(data);
      } catch {
        // Fall back to showing "--"
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsage();
  }, [days]);

  const conversationDisplay = isLoading
    ? null
    : usage?.conversations !== undefined
      ? usage.conversations.toLocaleString()
      : "--";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Conversations -- real API */}
      <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl border border-[#4a4455]/15 p-6 rounded-xl flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
          <span className="font-headline text-sm font-medium text-[#958da1]">
            Total Conversations
          </span>
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Live
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-4xl font-bold font-headline text-[#dae2fd]">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
            ) : (
              conversationDisplay
            )}
          </span>
          <div className="h-10 w-20 flex items-end gap-[2px]">
            {CONVERSATION_BARS.map((bar, index) => (
              <div
                key={index}
                className={`w-1 rounded-t-full ${bar.height}`}
                style={{ backgroundColor: `rgba(139, 92, 246, ${bar.opacity})` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl border border-[#4a4455]/15 p-6 rounded-xl flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
          <span className="font-headline text-sm font-medium text-[#958da1]">
            Messages ({days}D)
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-4xl font-bold font-headline text-[#dae2fd]">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#d2bbff]" />
            ) : (
              usage?.messages?.toLocaleString() ?? "--"
            )}
          </span>
          <div className="flex items-end gap-1 mb-1">
            {MESSAGE_BARS.map((bar, index) => (
              <div
                key={index}
                className={`w-2 rounded-t-sm ${bar.height}`}
                style={{ backgroundColor: `rgba(255, 185, 95, ${bar.opacity})` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tokens Consumed */}
      <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl border border-[#4a4455]/15 p-6 rounded-xl flex flex-col justify-between h-40">
        <div className="flex justify-between items-start">
          <span className="font-headline text-sm font-medium text-[#958da1]">
            Tokens Consumed
          </span>
          <span className="font-mono text-[10px] text-[#ffb95f]">$12.45 EST</span>
        </div>
        <div>
          <span className="text-3xl font-bold font-headline text-[#dae2fd]">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[#d2bbff]" />
            ) : usage?.tokens_used !== undefined ? (
              usage.tokens_used > 1000
                ? `${(usage.tokens_used / 1000).toFixed(0)}k`
                : String(usage.tokens_used)
            ) : "--"}
          </span>
          <div className="mt-4 h-1.5 w-full bg-[#060e20] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#d2bbff] w-[85%]" />
          </div>
          <p className="text-[10px] text-[#958da1] mt-2 font-mono">TOTAL TOKENS USED</p>
        </div>
      </div>

      {/* Most Used Agent */}
      <div className="bg-[rgba(23,31,51,0.6)] backdrop-blur-xl border border-[#4a4455]/15 p-6 rounded-xl flex flex-col justify-between h-40 border-l-4 border-l-[#ffb95f]">
        <div className="flex justify-between items-start">
          <span className="font-headline text-sm font-medium text-[#958da1]">
            Most Used Agent
          </span>
          <Star className="h-5 w-5 text-[#ffb95f] fill-[#ffb95f]" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ffb95f]/10 flex items-center justify-center border border-[#ffb95f]/20">
            <Search className="h-5 w-5 text-[#ffb95f]" />
          </div>
          <div>
            <span className="block text-xl font-bold font-headline text-[#ffb95f] tracking-wider">
              RESEARCHER
            </span>
            <span className="text-[10px] font-mono text-[#958da1]">42% USAGE DENSITY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
