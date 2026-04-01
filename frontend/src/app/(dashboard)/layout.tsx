"use client";

import { useState, useEffect, useCallback } from "react";
import { Menu, Bell } from "lucide-react";
import { toast } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationCenter } from "@/components/notification-center";
import { CommandPalette } from "@/components/command-palette";
import { useConversationStore } from "@/stores/conversation-store";
import { useLifeStore } from "@/stores/life-store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const conversationError = useConversationStore((s) => s.error);
  const clearConversationError = useConversationStore((s) => s.clearError);
  const lifeError = useLifeStore((s) => s.error);
  const clearLifeError = useLifeStore((s) => s.clearError);

  useEffect(() => {
    if (conversationError) {
      toast.error(conversationError);
      clearConversationError();
    }
  }, [conversationError, clearConversationError]);

  useEffect(() => {
    if (lifeError) {
      toast.error(lifeError);
      clearLifeError();
    }
  }, [lifeError, clearLifeError]);

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      setIsCommandPaletteOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen overflow-hidden bg-athena-background">
      {/* Mobile top bar — visible only on small screens */}
      <div className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between bg-surface-container-low/80 px-4 py-3 backdrop-blur-xl md:hidden">
        <button
          onClick={() => setIsSidebarOpen(true)}
          data-testid="mobile-menu-button"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="font-headline text-lg font-bold uppercase tracking-widest text-white">
          ATHENA
        </span>
        <button
          onClick={toggleNotifications}
          className="relative rounded-full p-2 text-violet-400 transition-colors hover:text-amber-400"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
        </button>
      </div>

      <Sidebar
        onNotificationClick={toggleNotifications}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content: top padding on mobile for top bar, left margin on desktop for sidebar */}
      <main className="flex flex-1 flex-col overflow-hidden pt-14 md:ml-[280px] md:pt-0">
        {children}
      </main>

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
}
