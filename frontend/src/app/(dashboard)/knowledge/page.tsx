"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api/client";

// --- Types ---

type EntityType = "person" | "organization" | "place" | "event" | "topic" | "skill";

interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  top: string;
  left: string;
  size: "sm" | "md" | "lg";
  attributes?: Record<string, string>;
  connections?: { type: string; name: string }[];
}

interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label: string;
}

interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
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

// --- Sub-components ---

function GraphNodeComponent({
  node,
  isSelected,
  onClick,
}: {
  node: GraphNode;
  isSelected: boolean;
  onClick: () => void;
}) {
  const style = ENTITY_STYLES[node.type];
  const { Icon } = style;

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
      style={{ top: node.top, left: node.left }}
      onClick={onClick}
      data-testid={`graph-node-${node.id}`}
    >
      <div
        className={`${NODE_SIZE[node.size]} rounded-full ${style.bg} flex items-center justify-center border-4 border-[#0b1326] ${style.shadow} transition-transform group-hover:scale-110 ${isSelected ? "ring-2 ring-white" : ""}`}
      >
        <Icon className={`${ICON_SIZE[node.size]} text-white`} />
      </div>
      <div className="mt-2 text-center">
        <span
          className={`font-headline font-bold ${LABEL_SIZE[node.size]} bg-[#171f33]/80 backdrop-blur px-2 py-0.5 rounded border border-[#4a4455]/20`}
        >
          {node.label}
        </span>
      </div>
    </div>
  );
}

function DetailPanel({
  node,
  onClose,
  onDelete,
}: {
  node: GraphNode;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(node.label);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    if (editLabel.trim() === node.label) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await api.patch(`/api/v1/knowledge/nodes/${node.id}`, { name: editLabel.trim() });
      toast.success("Node updated");
      setIsEditing(false);
      onClose(); // Close and let user re-fetch
    } catch {
      toast.error("Failed to update node");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/knowledge/nodes/${node.id}`);
      toast.success("Node deleted");
      onDelete(node.id);
      onClose();
    } catch {
      toast.error("Failed to delete node");
    }
  };

  const attributes = node.attributes
    ? Object.entries(node.attributes)
    : [];
  const connections = node.connections ?? [];

  return (
    <aside className="absolute top-4 right-4 bottom-4 w-80 bg-slate-900/60 backdrop-blur-2xl border border-[#4a4455]/10 rounded-3xl z-30 shadow-2xl flex flex-col overflow-hidden">
      <div className="p-6 border-b border-[#4a4455]/10">
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 rounded-2xl bg-[#7c3aed]/20 flex items-center justify-center text-[#d2bbff]">
            {(() => {
              const { Icon } = ENTITY_STYLES[node.type];
              return <Icon className="h-10 w-10" />;
            })()}
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
            data-testid="detail-panel-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <h2 className="text-2xl font-headline font-bold text-[#dae2fd] mb-1">
          {node.label}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#d2bbff] bg-[#d2bbff]/10 px-2 py-0.5 rounded">
            {node.type}
          </span>
        </div>
      </div>

      {isEditing && (
        <div className="px-6 pt-4 pb-0">
          <input
            className="w-full bg-[#060e20] border border-[#d2bbff]/30 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#d2bbff]"
            value={editLabel}
            onChange={(e) => setEditLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleEdit(); if (e.key === "Escape") setIsEditing(false); }}
            autoFocus
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {attributes.length > 0 && (
          <section>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">
              Core Attributes
            </h3>
            <div className="space-y-3">
              {attributes.map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">{key}</span>
                  <span className="text-[#dae2fd]">{value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {connections.length > 0 && (
          <section>
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">
              Direct Connections
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {connections.map((conn) => (
                <div
                  key={conn.name}
                  className="p-3 bg-[#222a3d]/40 rounded-xl border border-[#4a4455]/5 hover:border-[#d2bbff]/20 transition-all cursor-pointer group"
                >
                  <span className="text-[10px] font-mono text-cyan-400 block mb-1">
                    {conn.type}
                  </span>
                  <span className="text-xs font-bold font-headline group-hover:text-[#d2bbff]">
                    {conn.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {attributes.length === 0 && connections.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">
            No additional details available yet.
          </p>
        )}
      </div>

      <div className="p-6 bg-slate-950/40 flex gap-3">
        <button
          onClick={handleEdit}
          disabled={isSaving}
          className="flex-1 py-2 rounded-xl bg-[#222a3d] text-[#dae2fd] font-headline text-xs font-bold hover:bg-[#31394d] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          data-testid="entity-edit-btn"
        >
          {isSaving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Pencil className="h-3 w-3" />
          )}
          {isEditing ? "Save" : "Edit"}
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 py-2 rounded-xl bg-[#ffb4ab]/10 text-[#ffb4ab] font-headline text-xs font-bold hover:bg-[#93000a] hover:text-white transition-all flex items-center justify-center gap-2"
          data-testid="entity-delete-btn"
        >
          <Trash2 className="h-3 w-3" /> Delete
        </button>
      </div>
    </aside>
  );
}

function EmptyState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <div className="max-w-md text-center px-8">
        <div className="w-20 h-20 rounded-full bg-[#7c3aed]/10 flex items-center justify-center mx-auto mb-6">
          <Brain className="h-10 w-10 text-[#d2bbff]" />
        </div>
        <h2 className="text-2xl font-headline font-bold text-[#dae2fd] mb-3">
          Your Knowledge Graph is Empty
        </h2>
        <p className="text-slate-400 leading-relaxed">
          Start chatting with ATHENA and your knowledge graph will grow.
          Entities like people, topics, and events will appear here as connections.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-[#d2bbff] animate-spin" />
        <span className="font-mono text-sm text-slate-400">Loading knowledge graph...</span>
      </div>
    </div>
  );
}

// --- Connection Lines ---

function ConnectionLines({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
      {edges.map((edge) => {
        const fromNode = nodeMap.get(edge.from);
        const toNode = nodeMap.get(edge.to);
        if (!fromNode || !toNode) return null;

        const midX = `${(parseFloat(fromNode.left) + parseFloat(toNode.left)) / 2}%`;
        const midY = `${(parseFloat(fromNode.top) + parseFloat(toNode.top)) / 2}%`;

        return (
          <g key={edge.id}>
            <line
              className="stroke-slate-700 stroke-[1.5]"
              strokeDasharray="4"
              x1={fromNode.left}
              y1={fromNode.top}
              x2={toNode.left}
              y2={toNode.top}
            />
            {edge.label && (
              <text
                fill="#958da1"
                fontFamily="var(--font-mono-jb)"
                fontSize="10"
                x={midX}
                y={midY}
                textAnchor="middle"
              >
                {edge.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// --- Page ---

export default function KnowledgeGraphPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<EntityType>>(new Set());

  const fetchGraph = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const data = await api.get<KnowledgeGraphData>("/api/v1/knowledge/graph");
      setGraphData(data);
    } catch {
      setHasError(true);
      toast.error("Failed to load knowledge graph. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph]);

  const hasNodes = graphData && graphData.nodes.length > 0;

  // Apply type filters if any are active
  const visibleNodes = hasNodes
    ? activeFilters.size === 0
      ? graphData.nodes
      : graphData.nodes.filter((n) => activeFilters.has(n.type))
    : [];

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = hasNodes
    ? (graphData.edges ?? []).filter(
        (e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to)
      )
    : [];

  const selectedNodeData = hasNodes
    ? graphData.nodes.find((n) => n.id === selectedNode) ?? null
    : null;

  const handleNodeDelete = (deletedId: string) => {
    if (!graphData) return;
    setGraphData({
      nodes: graphData.nodes.filter((n) => n.id !== deletedId),
      edges: (graphData.edges ?? []).filter((e) => e.from !== deletedId && e.to !== deletedId),
    });
  };

  const handleAutoLayout = () => {
    if (!graphData || graphData.nodes.length === 0) return;
    const total = graphData.nodes.length;
    const updated = graphData.nodes.map((node, i) => {
      const angle = (i * 2 * Math.PI) / total;
      return {
        ...node,
        top: `${(50 + 35 * Math.sin(angle)).toFixed(1)}%`,
        left: `${(50 + 35 * Math.cos(angle)).toFixed(1)}%`,
      };
    });
    setGraphData({ ...graphData, nodes: updated });
  };

  const toggleFilter = (type: EntityType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  return (
    <div className="flex-1 relative bg-[#0b1326] overflow-hidden">
      {/* Radial background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.2),transparent)]" />
      </div>

      {/* Content states */}
      {isLoading && <LoadingState />}
      {!isLoading && !hasError && !hasNodes && <EmptyState />}

      {/* Graph content */}
      {!isLoading && hasNodes && (
        <>
          <ConnectionLines nodes={visibleNodes} edges={visibleEdges} />

          <div className="relative w-full h-full z-20">
            {visibleNodes.map((node) => (
              <GraphNodeComponent
                key={node.id}
                node={node}
                isSelected={selectedNode === node.id}
                onClick={() => setSelectedNode(node.id === selectedNode ? null : node.id)}
              />
            ))}
          </div>

          {/* Status indicator */}
          <div className="absolute top-4 left-4 z-30 flex items-center gap-3 px-4 py-2 bg-slate-950/40 backdrop-blur-xl border border-[#4a4455]/10 rounded-full">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-[#0b1326] bg-[#d2bbff] flex items-center justify-center text-[10px] text-[#3f008e] font-bold">
                {visibleNodes.length}
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-[#0b1326] bg-[#ffb95f] flex items-center justify-center text-[10px] text-[#472a00] font-bold">
                {visibleEdges.length}
              </div>
            </div>
            <div className="h-4 w-px bg-[#4a4455]/20" />
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-tighter">
              {visibleNodes.length} nodes, {visibleEdges.length} edges
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </>
      )}

      {/* Bottom Controls — always visible */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-2 bg-[#131b2e]/60 backdrop-blur-xl rounded-2xl border border-[#4a4455]/10 shadow-2xl">
        <button
          onClick={handleAutoLayout}
          className="p-3 bg-[#7c3aed] text-white rounded-xl hover:brightness-110 transition-all font-headline text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          data-testid="auto-layout-btn"
        >
          <Wand2 className="h-4 w-4" /> Auto-Layout
        </button>
        <div className="h-8 w-px bg-[#4a4455]/20 mx-2" />
        <div className="flex items-center gap-1">
          <button
            onClick={() => toast.info("Zoom coming in next update")}
            className="p-2 text-[#dae2fd] hover:bg-white/10 rounded-lg"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <span className="font-mono text-[10px] px-2 text-slate-400">100%</span>
          <button
            onClick={() => toast.info("Zoom coming in next update")}
            className="p-2 text-[#dae2fd] hover:bg-white/10 rounded-lg"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
        </div>
        <div className="h-8 w-px bg-[#4a4455]/20 mx-2" />
        <button
          onClick={() => toast.info("Focus mode coming in next update")}
          className="p-2 text-[#dae2fd] hover:bg-white/10 rounded-lg"
        >
          <Focus className="h-5 w-5" />
        </button>
      </div>

      {/* Entity Type Legend */}
      {hasNodes && (
        <div className="absolute bottom-8 left-8 z-30 p-4 bg-slate-900/60 backdrop-blur-xl border border-[#4a4455]/10 rounded-2xl shadow-2xl">
          <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-4">
            Entity Type Filters
          </h4>
          <div className="flex flex-wrap gap-2 max-w-xs">
            {FILTER_CHIPS.map((chip) => {
              const isActive = activeFilters.has(chip.type);
              return (
                <button
                  key={chip.type}
                  onClick={() => toggleFilter(chip.type)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all hover:opacity-80 ${
                    isActive ? chip.activeStyle : chip.inactiveStyle
                  }`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedNodeData && (
        <DetailPanel
          node={selectedNodeData}
          onClose={() => setSelectedNode(null)}
          onDelete={handleNodeDelete}
        />
      )}
    </div>
  );
}
