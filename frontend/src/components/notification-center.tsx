"use client";

import { useState } from "react";
import {
  X,
  Zap,
  Bell,
  Trophy,
  BarChart3,
  Star,
  Lightbulb,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────

type NotificationType = "nudge" | "reminder" | "achievement" | "system";
type FilterTab = "all" | "nudge" | "reminder" | "system";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  actionLabel?: string;
  isOld?: boolean;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

// ── Design tokens per notification type ────────────────────────────

const TYPE_STYLES: Record<
  NotificationType,
  { bg: string; text: string; icon: React.ElementType }
> = {
  nudge: { bg: "bg-amber-500/20", text: "text-amber-400", icon: Zap },
  reminder: { bg: "bg-[#7c3aed]/20", text: "text-[#d2bbff]", icon: Bell },
  achievement: { bg: "bg-emerald-500/10", text: "text-emerald-400", icon: Trophy },
  system: { bg: "bg-sky-500/10", text: "text-sky-400", icon: BarChart3 },
};

const OLD_ICON_MAP: Record<string, React.ElementType> = {
  "notif-6": Star,
  "notif-7": Lightbulb,
};

// ── Mock data ──────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    type: "nudge",
    title: "Health Check-in",
    description:
      "You haven't exercised in 3 days. Athena suggests a light 15-minute mobility flow.",
    time: "3m ago",
    isRead: false,
    actionLabel: "Start Session",
  },
  {
    id: "notif-2",
    type: "reminder",
    title: "Call Mom at 5:00 PM",
    description: "Scheduled follow-up regarding the weekend travel plans.",
    time: "1h ago",
    isRead: false,
  },
  {
    id: "notif-3",
    type: "achievement",
    title: "7-day streak!",
    description:
      "Consistency is key. You've completed your core focus tasks every day this week.",
    time: "5h ago",
    isRead: true,
  },
  {
    id: "notif-4",
    type: "system",
    title: "Weekly report ready",
    description:
      "Your productivity insights for this week have been synthesized and are ready for review.",
    time: "12h ago",
    isRead: false,
  },
  {
    id: "notif-5",
    type: "nudge",
    title: "Focus session available",
    description:
      "Your calendar is clear for the next 2 hours. Perfect time for deep work.",
    time: "14h ago",
    isRead: true,
  },
  {
    id: "notif-6",
    type: "achievement",
    title: "Skill Level Up",
    description:
      "Athena has detected improvement in your 'Deep Work' sessions.",
    time: "1d ago",
    isRead: true,
    isOld: true,
  },
  {
    id: "notif-7",
    type: "nudge",
    title: "Hydration Reminder",
    description: "It's been 3 hours since your last logged water intake.",
    time: "1d ago",
    isRead: true,
    isOld: true,
  },
];

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "nudge", label: "Nudges" },
  { key: "reminder", label: "Reminders" },
  { key: "system", label: "System" },
];

// ── Component ──────────────────────────────────────────────────────

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const filtered =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeFilter);

  const todayItems = filtered.filter((n) => !n.isOld);
  const yesterdayItems = filtered.filter((n) => n.isOld);
  const hasUnread = notifications.some((n) => !n.isRead);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-[#0b1326]/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <aside
        data-testid="notification-center"
        className={cn(
          "fixed right-0 top-0 z-[60] flex h-full w-[400px] flex-col",
          "bg-[#171f33]/60 backdrop-blur-xl",
          "border-l border-[#4a4455]/10 shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <header className="flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-2xl font-medium tracking-tight text-[#dae2fd]">
              Notifications
            </h2>
            <button
              onClick={onClose}
              data-testid="notification-close"
              className="rounded-full p-2 transition-colors hover:bg-[#222a3d]"
            >
              <X className="h-5 w-5 text-[#958da1] hover:text-[#dae2fd]" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {/* Filter tabs */}
            <div className="flex gap-2 rounded-full bg-[#060e20]/50 p-1">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-xs font-medium transition-colors",
                    activeFilter === tab.key
                      ? "bg-[#d2bbff] text-[#3f008e] shadow-sm"
                      : "text-[#958da1] hover:text-[#dae2fd]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-[#d2bbff]/60 transition-colors hover:text-[#d2bbff]"
              >
                Mark all read
              </button>
            )}
          </div>
        </header>

        {/* Notification list */}
        <div className="flex-grow space-y-4 overflow-y-auto px-6 pb-12 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {todayItems.length === 0 && yesterdayItems.length === 0 && (
            <p className="py-12 text-center font-mono text-xs text-[#958da1]">
              No notifications to show
            </p>
          )}

          {todayItems.map((notif) => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}

          {yesterdayItems.length > 0 && (
            <>
              <div className="pb-2 pt-4">
                <span className="px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#958da1]">
                  Yesterday
                </span>
              </div>
              {yesterdayItems.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-[#4a4455]/5 bg-[#222a3d]/40 p-6">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2d3449] px-4 py-3 text-sm font-semibold text-[#dae2fd] transition-all hover:bg-[#31394d]">
            <Settings className="h-4 w-4" />
            Manage Notification Settings
          </button>
        </footer>
      </aside>
    </>
  );
}

// ── Single notification row ────────────────────────────────────────

function NotificationItem({ notification }: { notification: Notification }) {
  const style = TYPE_STYLES[notification.type];
  const Icon = notification.isOld
    ? OLD_ICON_MAP[notification.id] ?? style.icon
    : style.icon;

  return (
    <div
      className={cn(
        "group relative cursor-pointer rounded-xl p-4 transition-all duration-300",
        "bg-[#131b2e] hover:bg-[#222a3d]",
        notification.isOld && "opacity-70",
        notification.type === "achievement" &&
          "border border-transparent hover:border-emerald-500/20"
      )}
    >
      <div className="flex gap-4">
        {/* Icon circle */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            style.bg
          )}
        >
          <Icon className={cn("h-5 w-5", style.text)} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-grow">
          <div className="mb-1 flex items-start justify-between">
            <h3 className="truncate text-sm font-semibold leading-tight text-[#dae2fd]">
              {notification.title}
            </h3>
            <span className="ml-2 shrink-0 font-mono text-[10px] uppercase tracking-wider text-[#958da1]">
              {notification.time}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[#ccc3d8]">
            {notification.description}
          </p>
          {notification.actionLabel && (
            <div className="mt-3 flex gap-2">
              <button className="rounded-md bg-[#2d3449] px-3 py-1 text-[11px] font-semibold transition-colors hover:bg-[#7c3aed]/20 hover:text-[#d2bbff]">
                {notification.actionLabel}
              </button>
            </div>
          )}
        </div>

        {/* Unread dot */}
        {!notification.isRead && (
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#d2bbff]" />
        )}
      </div>
    </div>
  );
}
