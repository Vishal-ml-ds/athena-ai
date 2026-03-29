"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Plus,
  MessageCircle,
  Trash2,
  Settings,
  HelpCircle,
  Heart,
  FileText,
  Globe,
  Share2,
  BarChart3,
} from "lucide-react";
import { useConversationStore } from "@/stores/conversation-store";
import { cn } from "@/lib/utils";

const NAV_MODULES = [
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/life", label: "Life OS", icon: Heart },
  { href: "/memory", label: "Memory", icon: Brain },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/browser", label: "Browser", icon: Globe },
  { href: "/knowledge", label: "Knowledge", icon: Share2 },
  { href: "/report", label: "Report", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    conversations,
    activeConversationId,
    fetchConversations,
    createConversation,
    selectConversation,
    deleteConversation,
  } = useConversationStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const handleNewChat = async () => {
    await createConversation();
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col",
        "bg-[#131b2e]/60 backdrop-blur-xl",
        "border-r border-white/5",
        "shadow-[20px_0_40px_-12px_rgba(124,58,237,0.12)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-6">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            "bg-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          )}
        >
          <Brain className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-headline text-xl font-bold uppercase tracking-widest text-white">
            ATHENA AI
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#d2bbff]/60">
            Celestial Intelligence
          </p>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="mb-4 px-4">
        <button
          onClick={handleNewChat}
          data-testid="new-chat-button"
          className={cn(
            "group flex w-full items-center justify-center gap-2",
            "rounded-xl bg-[#7c3aed] px-4 py-3",
            "font-medium text-[#ede0ff]",
            "shadow-lg shadow-[#7c3aed]/20",
            "transition-all hover:brightness-110"
          )}
        >
          <Plus className="h-5 w-5 transition-transform duration-200 group-active:scale-90" />
          <span className="font-headline tracking-tight">New Chat</span>
        </button>
      </div>

      {/* Modules Navigation */}
      <div className="px-3 pb-2">
        <div className="mb-2 px-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#958da1]">
            Modules
          </span>
        </div>
        <div className="space-y-0.5">
          {NAV_MODULES.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5",
                  "font-headline text-sm tracking-tight transition-all duration-200",
                  isActive
                    ? "bg-violet-500/10 font-medium text-violet-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Conversation List */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <div className="mb-2 px-3 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#958da1]">
            Recent Chats
          </span>
        </div>

        {conversations.map((conv) => {
          const isActive = activeConversationId === conv.id;
          return (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              data-testid={`conversation-${conv.id}`}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-4 py-2.5",
                "font-headline text-sm tracking-tight transition-all duration-300",
                isActive
                  ? "bg-violet-500/10 font-medium text-violet-400"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <MessageCircle
                className="h-4 w-4 shrink-0"
                fill={isActive ? "currentColor" : "none"}
              />
              <span className="flex-1 truncate text-left">{conv.title}</span>
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }
                }}
                className={cn(
                  "opacity-0 transition-opacity group-hover:opacity-100",
                  "text-slate-400 hover:text-red-400"
                )}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}

        {conversations.length === 0 && (
          <p className="px-3 py-4 text-center font-mono text-xs text-[#958da1]">
            No chats yet
          </p>
        )}
      </nav>

      {/* Footer */}
      <div className="mt-auto space-y-1 border-t border-white/5 p-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="font-headline tracking-tight">Help Center</span>
        </a>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors",
            pathname === "/settings" ? "text-violet-400" : "text-slate-400 hover:text-white"
          )}
        >
          <Settings className="h-4 w-4" />
          <span className="font-headline tracking-tight">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
