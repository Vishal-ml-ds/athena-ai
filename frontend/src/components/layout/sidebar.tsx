"use client";

import { useEffect } from "react";
import { MessageSquare, Plus, Trash2, Settings, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversationStore } from "@/stores/conversation-store";
import { cn } from "@/lib/utils";

export function Sidebar() {
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
    <aside className="flex h-full w-[280px] flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Brain className="h-6 w-6 text-purple-500" />
        <h1 className="text-lg font-bold text-foreground">ATHENA</h1>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-3">
        <Button
          onClick={handleNewChat}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "group flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent",
                activeConversationId === conv.id && "bg-accent"
              )}
              onClick={() => selectConversation(conv.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-foreground">
                {conv.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(conv.id);
                }}
                className="hidden text-muted-foreground hover:text-destructive group-hover:block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {conversations.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              No conversations yet.
              <br />
              Start a new chat!
            </p>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3">
        <Button variant="ghost" className="w-full justify-start text-muted-foreground">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </aside>
  );
}
