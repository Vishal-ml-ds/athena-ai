"use client";

import { useState } from "react";
import {
  User,
  Building2,
  MapPin,
  Rocket,
  Globe,
  Brain,
  ZoomIn,
  ZoomOut,
  Focus,
  Wand2,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

// --- Types ---

type EntityType = "person" | "organization" | "place" | "event" | "topic" | "skill";

interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  top: string;
  left: string;
  size: "sm" | "md" | "lg";
}

interface Connection {
  id: string;
  from: string;
  to: string;
  label: string;
}

// --- Constants ---

const ENTITY_STYLES: Record<EntityType, { bg: string; shadow: string; Icon: typeof User }> = {
  person: { bg: "bg-[#7c3aed]", shadow: "shadow-[0_0_20px_rgba(124,58,237,0.4)]", Icon: User },
  organization: { bg: "bg-cyan-600", shadow: "shadow-[0_0_20px_rgba(8,145,178,0.4)]", Icon: Building2 },
  place: { bg: "bg-amber-500", shadow: "shadow-[0_0_20px_rgba(245,158,11,0.4)]", Icon: MapPin },
  event: { bg: "bg-emerald-500", shadow: "shadow-[0_0_20px_rgba(16,185,129,0.4)]", Icon: Rocket },
  topic: { bg: "bg-blue-600", shadow: "shadow-[0_0_20px_rgba(37,99,235,0.4)]", Icon: Globe },
  skill: { bg: "bg-pink-600", shadow: "shadow-[0_0_20px_rgba(219,39,119,0.4)]", Icon: Brain },
};

const FILTER_CHIPS: { label: string; type: EntityType; activeStyle: string; inactiveStyle: string }[] = [
  { label: "Person", type: "person", activeStyle: "bg-[#7c3aed] text-white", inactiveStyle: "bg-[#7c3aed]/20 border border-[#7c3aed]/40 text-purple-400" },
  { label: "Topic", type: "topic", activeStyle: "bg-blue-600 text-white", inactiveStyle: "bg-blue-600/20 border border-blue-600/40 text-blue-400" },
  { label: "Event", type: "event", activeStyle: "bg-emerald-600 text-white", inactiveStyle: "bg-emerald-600/20 border border-emerald-600/40 text-emerald-400" },
  { label: "Place", type: "place", activeStyle: "bg-amber-600 text-white", inactiveStyle: "bg-amber-600/20 border border-amber-600/40 text-amber-400" },
  { label: "Org", type: "organization", activeStyle: "bg-cyan-600 text-white", inactiveStyle: "bg-cyan-600/20 border border-cyan-600/40 text-cyan-400" },
  { label: "Skill", type: "skill", activeStyle: "bg-pink-600 text-white", inactiveStyle: "bg-pink-600/20 border border-pink-600/40 text-pink-400" },
];

const NODE_SIZE = { sm: "w-12 h-12", md: "w-14 h-14", lg: "w-16 h-16" } as const;
const ICON_SIZE = { sm: "h-5 w-5", md: "h-6 w-6", lg: "h-7 w-7" } as const;
const LABEL_SIZE = { sm: "text-xs", md: "text-xs", lg: "text-sm" } as const;

const MOCK_NODES: GraphNode[] = [
  { id: "elon", label: "Elon Musk", type: "person", top: "30%", left: "40%", size: "lg" },
  { id: "spacex", label: "SpaceX", type: "organization", top: "45%", left: "55%", size: "lg" },
  { id: "boca", label: "Boca Chica, TX", type: "place", top: "40%", left: "70%", size: "sm" },
  { id: "neuralink", label: "Neuralink", type: "organization", top: "65%", left: "48%", size: "md" },
  { id: "ift3", label: "IFT-3 Launch", type: "event", top: "55%", left: "75%", size: "md" },
  { id: "mars", label: "Mars Colonization", type: "topic", top: "25%", left: "30%", size: "md" },
];

const MOCK_CONNECTIONS: Connection[] = [
  { id: "c1", from: "elon", to: "spacex", label: "FOUNDER_OF" },
  { id: "c2", from: "spacex", to: "neuralink", label: "CEO_AT" },
  { id: "c3", from: "spacex", to: "boca", label: "LOCATED_IN" },
  { id: "c4", from: "neuralink", to: "mars", label: "" },
  { id: "c5", from: "elon", to: "mars", label: "" },
  { id: "c6", from: "boca", to: "ift3", label: "" },
];

const SELECTED_NODE_DATA = {
  name: "Elon Musk",
  type: "Person" as const,
  attributes: [
    { key: "Role", value: "Serial Entrepreneur" },
    { key: "Location", value: "Texas, USA" },
    { key: "Net Worth", value: "$200B+" },
  ],
  connections: [
    { type: "Organization", name: "SpaceX" },
    { type: "Organization", name: "Tesla" },
    { type: "Topic", name: "AI Ethics" },
  ],
  logs: [
    { text: '"Discussed the implications of multi-planetary travel during the Q3 Strategy Briefing..."', date: "MAR 14, 2024 - 09:12 AM" },
    { text: '"User requested a summary of the Neuralink progress report and its competitor landscape..."', date: "FEB 28, 2024 - 14:45 PM" },
  ],
};

// --- Components ---

function GraphNodeComponent({ node, isSelected, onClick }: { node: GraphNode; isSelected: boolean; onClick: () => void }) {
  const style = ENTITY_STYLES[node.type];
  const { Icon } = style;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
      style={{ top: node.top, left: node.left }}
      onClick={onClick}
    >
      <div
        className={`${NODE_SIZE[node.size]} rounded-full ${style.bg} flex items-center justify-center border-4 border-[#0b1326] ${style.shadow} transition-transform group-hover:scale-110 ${isSelected ? "ring-2 ring-white" : ""}`}
      >
        <Icon className={`${ICON_SIZE[node.size]} text-white`} />
      </div>
      <div className="mt-2 text-center">
        <span
          className={`font-[family-name:'Space_Grotesk'] font-bold ${LABEL_SIZE[node.size]} bg-[#171f33]/80 backdrop-blur px-2 py-0.5 rounded border border-[#4a4455]/20`}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
}

function DetailPanel({ onClose }: { onClose: () => void }) {
  const data = SELECTED_NODE_DATA;

  return (
    <aside className="absolute top-4 right-4 bottom-4 w-80 bg-slate-900/60 backdrop-blur-2xl border border-[#4a4455]/10 rounded-3xl z-30 shadow-2xl flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[#4a4455]/10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff]">
            <User className="h-10 w-10" />
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-2xl font-[family-name:'Space_Grotesk'] font-bold text-[#dae2fd] mb-1">
          {data.name}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#d2bbff] bg-[#d2bbff]/10 px-2 py-0.5 rounded">
            {data.type}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffb95f] bg-[#ffb95f]/10 px-2 py-0.5 rounded">
            High Influence
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Attributes */}
        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">
            Core Attributes
          </h3>
          <div className="space-y-3">
            {data.attributes.map((attr) => (
              <div key={attr.key} className="flex justify-between items-center text-sm">
                <span className="text-slate-400">{attr.key}</span>
                <span className={attr.key === "Net Worth" ? "text-[#ffb95f]" : "text-[#dae2fd]"}>
                  {attr.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Connections */}
        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">
            Direct Connections
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {data.connections.map((conn) => (
              <div
                key={conn.name}
                className="p-3 bg-[#222a3d]/40 rounded-xl border border-[#4a4455]/5 hover:border-[#d2bbff]/20 transition-all cursor-pointer group"
              >
                <span className="text-[10px] font-mono text-cyan-400 block mb-1">
                  {conn.type}
                </span>
                <span className="text-xs font-bold font-[family-name:'Space_Grotesk'] group-hover:text-[#d2bbff]">
                  {conn.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Logs */}
        <section>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">
            Related Intelligence Logs
          </h3>
          <div className="space-y-3">
            {data.logs.map((log, i) => (
              <div
                key={i}
                className={`p-3 bg-slate-950/40 rounded-xl border-l-2 ${i === 0 ? "border-[#d2bbff]" : "border-[#4a4455]"}`}
              >
                <p className="text-[11px] leading-relaxed text-[#ccc3d8]">{log.text}</p>
                <span className="text-[9px] font-mono text-slate-500 mt-2 block">{log.date}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 bg-slate-950/40 flex gap-3">
        <button className="flex-1 py-2 rounded-xl bg-[#222a3d] text-[#dae2fd] font-[family-name:'Space_Grotesk'] text-xs font-bold hover:bg-[#31394d] transition-colors flex items-center justify-center gap-2">
          <Pencil className="h-3 w-3" /> Edit
        </button>
        <button className="flex-1 py-2 rounded-xl bg-[#ffb4ab]/10 text-[#ffb4ab] font-[family-name:'Space_Grotesk'] text-xs font-bold hover:bg-[#93000a] hover:text-white transition-all flex items-center justify-center gap-2">
          <Trash2 className="h-3 w-3" /> Delete
        </button>
      </div>
    </aside>
  );
}

// --- Page ---

export default function KnowledgeGraphPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>("elon");

  return (
    <div className="flex-1 relative bg-[#0b1326] overflow-hidden">
      {/* Radial background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.2),transparent)]" />
      </div>

      {/* SVG Connection Lines */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        <line className="stroke-slate-700 stroke-[1.5]" strokeDasharray="4" x1="40%" y1="30%" x2="55%" y2="45%" />
        <line className="stroke-slate-700 stroke-[1.5]" strokeDasharray="4" x1="55%" y1="45%" x2="48%" y2="65%" />
        <line className="stroke-slate-700 stroke-[1.5]" strokeDasharray="4" x1="55%" y1="45%" x2="70%" y2="40%" />
        <line className="stroke-slate-700 stroke-[1.5]" strokeDasharray="4" x1="48%" y1="65%" x2="30%" y2="25%" />
        <line className="stroke-slate-700 stroke-[1.5]" strokeDasharray="4" x1="40%" y1="30%" x2="30%" y2="25%" />
        <line className="stroke-slate-700 stroke-[1.5]" strokeDasharray="4" x1="70%" y1="40%" x2="75%" y2="55%" />

        {/* Relationship labels */}
        <text fill="#958da1" fontFamily="JetBrains Mono, monospace" fontSize="10" x="47%" y="37%">FOUNDER_OF</text>
        <text fill="#958da1" fontFamily="JetBrains Mono, monospace" fontSize="10" x="62%" y="42%">LOCATED_IN</text>
        <text fill="#958da1" fontFamily="JetBrains Mono, monospace" fontSize="10" x="51%" y="55%">CEO_AT</text>
      </svg>

      {/* Graph Nodes */}
      <div className="relative w-full h-full z-20">
        {MOCK_NODES.map((node) => (
          <GraphNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode === node.id}
            onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
          />
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-2 bg-[#131b2e]/60 backdrop-blur-xl rounded-2xl border border-[#4a4455]/10 shadow-2xl">
        <button className="p-3 bg-[#7c3aed] text-white rounded-xl hover:brightness-110 transition-all font-[family-name:'Space_Grotesk'] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
          <Wand2 className="h-4 w-4" /> Auto-Layout
        </button>
        <div className="h-8 w-px bg-[#4a4455]/20 mx-2" />
        <div className="flex items-center gap-1">
          <button className="p-2 text-[#dae2fd] hover:bg-white/10 rounded-lg">
            <ZoomIn className="h-5 w-5" />
          </button>
          <span className="font-mono text-[10px] px-2 text-slate-400">100%</span>
          <button className="p-2 text-[#dae2fd] hover:bg-white/10 rounded-lg">
            <ZoomOut className="h-5 w-5" />
          </button>
        </div>
        <div className="h-8 w-px bg-[#4a4455]/20 mx-2" />
        <button className="p-2 text-[#dae2fd] hover:bg-white/10 rounded-lg">
          <Focus className="h-5 w-5" />
        </button>
      </div>

      {/* Entity Type Legend */}
      <div className="absolute bottom-8 left-8 z-30 p-4 bg-slate-900/60 backdrop-blur-xl border border-[#4a4455]/10 rounded-2xl shadow-2xl">
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">
          Entity Type Filters
        </h4>
        <div className="flex flex-wrap gap-2 max-w-xs">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.type}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${chip.inactiveStyle} hover:opacity-80`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current" />
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3 px-4 py-2 bg-slate-950/40 backdrop-blur-xl border border-[#4a4455]/10 rounded-full">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full border-2 border-[#0b1326] bg-[#d2bbff] flex items-center justify-center text-[10px] text-[#3f008e] font-bold">
            14
          </div>
          <div className="w-6 h-6 rounded-full border-2 border-[#0b1326] bg-[#ffb95f] flex items-center justify-center text-[10px] text-[#472a00] font-bold">
            08
          </div>
        </div>
        <div className="h-4 w-px bg-[#4a4455]/20" />
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-tighter">
          Syncing Real-time Knowledge Graph...
        </span>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {/* Detail Panel */}
      {selectedNode && <DetailPanel onClose={() => setSelectedNode(null)} />}
    </div>
  );
}
