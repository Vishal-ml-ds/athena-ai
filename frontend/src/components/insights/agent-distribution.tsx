"use client";

// --- Types ---

interface AgentDistEntry {
  name: string;
  color: string;
  percentage: number;
}

// --- Constants ---

const AGENT_DISTRIBUTION: AgentDistEntry[] = [
  { name: "Researcher", color: "#60a5fa", percentage: 42 },
  { name: "Coder", color: "#22d3ee", percentage: 21 },
  { name: "General", color: "#d2bbff", percentage: 15 },
  { name: "Browser", color: "#fb923c", percentage: 11 },
  { name: "Scheduler", color: "#34d399", percentage: 7 },
  { name: "Finance", color: "#a78bfa", percentage: 3 },
  { name: "Life Coach", color: "#fbbf24", percentage: 1 },
];

const ACTIVE_AGENT_COUNT = 6;

// --- Component ---

export function AgentDistribution() {
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
            <span className="block text-3xl font-bold font-headline text-white">
              {ACTIVE_AGENT_COUNT}
            </span>
            <span className="text-[10px] uppercase font-mono text-[#958da1] tracking-widest">
              Active Units
            </span>
          </div>
        </div>
      </div>

      {/* Bar breakdown */}
      <div className="space-y-3 mt-6">
        {AGENT_DISTRIBUTION.map((agent) => (
          <div key={agent.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="text-[#dae2fd]">{agent.name}</span>
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
    </div>
  );
}
