"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageSquarePlus,
  BarChart3,
  Banknote,
  CheckCircle2,
  Heart,
  Brain,
  FileText,
  Globe,
  Share2,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { useConversationStore } from "@/stores/conversation-store";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  section: "quick-actions" | "modules";
  shortcut?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BACKDROP_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const PANEL_VARIANTS = {
  hidden: { opacity: 0, y: -20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const TRANSITION_SPEED = { duration: 0.15 };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { conversations, createConversation } = useConversationStore();

  // Build the command list
  const commands = useMemo<CommandItem[]>(() => {
    const navigate = (path: string) => {
      router.push(path);
      onClose();
    };

    return [
      // Quick Actions
      {
        id: "new-chat",
        label: "New Chat",
        description: "Initialize a fresh intelligence session",
        icon: MessageSquarePlus,
        section: "quick-actions",
        shortcut: "N",
        action: async () => {
          await createConversation();
          navigate("/chat");
        },
      },
      {
        id: "weekly-report",
        label: "Weekly Report",
        description: "Generate your current intelligence digest",
        icon: BarChart3,
        section: "quick-actions",
        shortcut: "R",
        action: () => navigate("/report"),
      },
      {
        id: "log-expense",
        label: "Log Expense",
        description: "Track financial transactions in fiscal core",
        icon: Banknote,
        section: "quick-actions",
        shortcut: "E",
        action: () => navigate("/life?tab=finance"),
      },
      {
        id: "log-habit",
        label: "Log Habit",
        description: "Confirm completion of daily directives",
        icon: CheckCircle2,
        section: "quick-actions",
        shortcut: "H",
        action: () => navigate("/life?tab=habits"),
      },

      // Modules
      {
        id: "mod-lifeos",
        label: "Life OS",
        description: "Dashboard and life management",
        icon: LayoutDashboard,
        section: "modules",
        action: () => navigate("/life"),
      },
      {
        id: "mod-memory",
        label: "Memory",
        description: "AI memory and knowledge",
        icon: Brain,
        section: "modules",
        action: () => navigate("/memory"),
      },
      {
        id: "mod-docs",
        label: "Documents",
        description: "Document management and RAG",
        icon: FileText,
        section: "modules",
        action: () => navigate("/documents"),
      },
      {
        id: "mod-browser",
        label: "Browser",
        description: "Web browsing automation",
        icon: Globe,
        section: "modules",
        action: () => navigate("/browser"),
      },
      {
        id: "mod-knowledge",
        label: "Knowledge",
        description: "Knowledge graph explorer",
        icon: Share2,
        section: "modules",
        action: () => navigate("/knowledge"),
      },
      {
        id: "mod-settings",
        label: "Settings",
        description: "System configuration",
        icon: Settings,
        section: "modules",
        action: () => navigate("/settings"),
      },
    ];
  }, [router, onClose, createConversation]);

  // Filter items based on search
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;
    const query = searchQuery.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query)
    );
  }, [commands, searchQuery]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations.slice(0, 3);
    const query = searchQuery.toLowerCase();
    return conversations
      .filter((c) => c.title.toLowerCase().includes(query))
      .slice(0, 5);
  }, [conversations, searchQuery]);

  // Total navigable items
  const totalItems = filteredCommands.length + filteredConversations.length;

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      // Delay focus to let animation start
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Clamp selected index when results change
  useEffect(() => {
    if (selectedIndex >= totalItems && totalItems > 0) {
      setSelectedIndex(totalItems - 1);
    }
  }, [totalItems, selectedIndex]);

  // Execute the item at a given index
  const executeItem = useCallback(
    (index: number) => {
      if (index < filteredCommands.length) {
        filteredCommands[index].action();
        onClose();
      } else {
        const convIndex = index - filteredCommands.length;
        const conv = filteredConversations[convIndex];
        if (conv) {
          const { selectConversation } = useConversationStore.getState();
          selectConversation(conv.id);
          router.push("/chat");
          onClose();
        }
      }
    },
    [filteredCommands, filteredConversations, router, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(totalItems, 1));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1)
        );
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        executeItem(selectedIndex);
      }
    },
    [onClose, totalItems, selectedIndex, executeItem]
  );

  // Group commands by section for rendering
  const quickActions = filteredCommands.filter(
    (c) => c.section === "quick-actions"
  );
  const modules = filteredCommands.filter((c) => c.section === "modules");

  // Track the running index for selection highlighting
  let runningIndex = 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[140px] sm:px-6">
          {/* Backdrop */}
          <motion.div
            variants={BACKDROP_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={TRANSITION_SPEED}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Palette Panel */}
          <motion.div
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={TRANSITION_SPEED}
            className={cn(
              "glass-panel relative w-full max-w-[600px] overflow-hidden rounded-2xl",
              "border border-[#4a4455]/10",
              "shadow-[0_20px_40px_-12px_rgba(124,58,237,0.12)]"
            )}
            onKeyDown={handleKeyDown}
          >
            {/* Search Header */}
            <div className="relative flex items-center border-b border-[#4a4455]/10 px-6 py-5">
              <Search className="mr-4 h-6 w-6 text-[#d2bbff]" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Ask ATHENA anything or search..."
                data-testid="command-palette-search"
                className={cn(
                  "w-full border-none bg-transparent font-mono text-lg text-[#dae2fd]",
                  "placeholder:text-[#958da1]/40 focus:outline-none focus:ring-0"
                )}
              />
              <div className="ml-4 flex items-center gap-1 opacity-40">
                <kbd className="rounded border border-[#4a4455] px-1.5 py-0.5 font-mono text-[10px] text-[#958da1]">
                  Ctrl
                </kbd>
                <kbd className="rounded border border-[#4a4455] px-1.5 py-0.5 font-mono text-[10px] text-[#958da1]">
                  K
                </kbd>
              </div>
            </div>

            {/* Scrollable Results */}
            <div className="max-h-[480px] overflow-y-auto p-2">
              {/* Quick Actions */}
              {quickActions.length > 0 && (
                <div className="px-4 py-3">
                  <h3 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#ffb95f]">
                    Quick Actions
                  </h3>
                  <div className="space-y-1">
                    {quickActions.map((cmd) => {
                      const itemIndex = runningIndex++;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          data-testid={`cmd-${cmd.id}`}
                          className={cn(
                            "group flex w-full items-center justify-between rounded-xl p-3 transition-all duration-200",
                            itemIndex === selectedIndex
                              ? "bg-[#7c3aed]/10"
                              : "hover:bg-[#7c3aed]/10"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                                itemIndex === selectedIndex
                                  ? "bg-[#7c3aed] text-white"
                                  : "bg-[#222a3d] text-[#d2bbff] group-hover:bg-[#7c3aed] group-hover:text-white"
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-semibold text-[#dae2fd]">
                                {cmd.label}
                              </p>
                              <p className="text-xs text-[#958da1]">
                                {cmd.description}
                              </p>
                            </div>
                          </div>
                          {cmd.shortcut && (
                            <span className="hidden items-center gap-1 opacity-0 transition-opacity group-hover:opacity-40 sm:flex">
                              <kbd className="rounded border border-[#4a4455] px-1.5 py-0.5 font-mono text-[10px] text-[#958da1]">
                                Ctrl
                              </kbd>
                              <kbd className="rounded border border-[#4a4455] px-1.5 py-0.5 font-mono text-[10px] text-[#958da1]">
                                {cmd.shortcut}
                              </kbd>
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Conversations */}
              {filteredConversations.length > 0 && (
                <div className="mt-2 px-4 py-3">
                  <h3 className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#ffb95f]">
                    Recent Conversations
                  </h3>
                  <div className="space-y-1">
                    {filteredConversations.map((conv) => {
                      const itemIndex = runningIndex++;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => executeItem(itemIndex)}
                          className={cn(
                            "w-full rounded-xl p-3 text-left transition-all",
                            itemIndex === selectedIndex
                              ? "bg-[#7c3aed]/10"
                              : "hover:bg-[#7c3aed]/10"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-semibold text-[#dae2fd]">
                              {conv.title}
                            </p>
                            <span className="font-mono text-[9px] uppercase text-[#958da1]/50">
                              {formatRelativeTime(conv.updatedAt)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Modules */}
              {modules.length > 0 && (
                <div className="mt-2 px-4 py-3 pb-6">
                  <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-[#ffb95f]">
                    Modules
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {modules.map((cmd) => {
                      const itemIndex = runningIndex++;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => {
                            cmd.action();
                            onClose();
                          }}
                          data-testid={`cmd-${cmd.id}`}
                          className={cn(
                            "group flex flex-col items-center rounded-xl p-2 transition-all",
                            itemIndex === selectedIndex
                              ? "bg-white/5"
                              : "hover:bg-white/5"
                          )}
                        >
                          <div
                            className={cn(
                              "mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                              "bg-[#171f33] text-[#958da1] group-hover:text-[#d2bbff]"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-medium text-[#958da1] group-hover:text-[#dae2fd]">
                            {cmd.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {totalItems === 0 && (
                <div className="px-4 py-12 text-center">
                  <p className="font-mono text-sm text-[#958da1]">
                    No results for &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#4a4455]/10 bg-[#131b2e]/50 px-6 py-4">
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <kbd className="rounded bg-[#222a3d] px-1 py-0.5 font-mono text-[9px] text-[#958da1]">
                    ESC
                  </kbd>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#958da1]/60">
                    to close
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <kbd className="rounded bg-[#222a3d] px-1 py-0.5 font-mono text-[9px] text-[#958da1]">
                      &uarr;
                    </kbd>
                    <kbd className="rounded bg-[#222a3d] px-1 py-0.5 font-mono text-[9px] text-[#958da1]">
                      &darr;
                    </kbd>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#958da1]/60">
                    to navigate
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded bg-[#222a3d] px-1 py-0.5 font-mono text-[9px] text-[#958da1]">
                    &crarr;
                  </kbd>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#958da1]/60">
                    to select
                  </span>
                </div>
              </div>
              <div className="hidden items-center gap-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-[#ffb95f] shadow-[0_0_8px_rgba(255,185,95,0.4)]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#ffb95f]">
                  Athena Online
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatRelativeTime(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
