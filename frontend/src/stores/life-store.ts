/**
 * Zustand store for Life OS — habits, goals, finance, health.
 */

import { create } from "zustand";
import { api } from "@/lib/api/client";

interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  streak_current: number;
  streak_best: number;
  is_active: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  target_date: string | null;
  progress: number;
  status: string;
}

interface FinanceEntry {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface FinanceSummary {
  income: number;
  expenses: number;
  savings: number;
  net: number;
  by_category: Record<string, number>;
}

interface HealthLog {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  notes: string;
  logged_at: string;
}

interface LifeState {
  habits: Habit[];
  goals: Goal[];
  financeEntries: FinanceEntry[];
  financeSummary: FinanceSummary | null;
  healthLogs: HealthLog[];
  healthTrends: Record<string, { value: number; unit: string; date: string }[]>;
  isLoading: boolean;
  error: string | null;

  clearError: () => void;
  fetchHabits: () => Promise<void>;
  createHabit: (data: { name: string; description?: string; category?: string }) => Promise<void>;
  logHabit: (habitId: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;

  fetchGoals: () => Promise<void>;
  createGoal: (data: { title: string; category: string; target_date?: string }) => Promise<void>;
  updateGoalProgress: (goalId: string, progress: number) => Promise<void>;

  fetchFinance: () => Promise<void>;
  addFinanceEntry: (data: { type: string; amount: number; category: string; description?: string }) => Promise<void>;
  fetchFinanceSummary: () => Promise<void>;

  fetchHealth: (metricType?: string) => Promise<void>;
  logHealth: (data: { metric_type: string; value: number; unit: string }) => Promise<void>;
  fetchHealthTrends: () => Promise<void>;
}

const toErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong";

export const useLifeStore = create<LifeState>((set) => ({
  habits: [],
  goals: [],
  financeEntries: [],
  financeSummary: null,
  healthLogs: [],
  healthTrends: {},
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // Habits
  fetchHabits: async () => {
    try {
      const data = await api.get<Habit[]>("/api/v1/life/habits");
      set({ habits: data });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  createHabit: async (data) => {
    try {
      await api.post("/api/v1/life/habits", data);
      const habits = await api.get<Habit[]>("/api/v1/life/habits");
      set({ habits });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  logHabit: async (habitId) => {
    try {
      await api.post(`/api/v1/life/habits/${habitId}/log`);
      const habits = await api.get<Habit[]>("/api/v1/life/habits");
      set({ habits });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  deleteHabit: async (habitId) => {
    try {
      await api.delete(`/api/v1/life/habits/${habitId}`);
      set((s) => ({ habits: s.habits.filter((h) => h.id !== habitId) }));
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  // Goals
  fetchGoals: async () => {
    try {
      const data = await api.get<Goal[]>("/api/v1/life/goals?status=active");
      set({ goals: data });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  createGoal: async (data) => {
    try {
      await api.post("/api/v1/life/goals", data);
      const goals = await api.get<Goal[]>("/api/v1/life/goals?status=active");
      set({ goals });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  updateGoalProgress: async (goalId, progress) => {
    try {
      await api.patch(`/api/v1/life/goals/${goalId}/progress`, { progress });
      set((s) => ({
        goals: s.goals.map((g) =>
          g.id === goalId ? { ...g, progress, status: progress >= 100 ? "completed" : g.status } : g
        ),
      }));
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  // Finance
  fetchFinance: async () => {
    try {
      const data = await api.get<FinanceEntry[]>("/api/v1/life/finance?limit=50");
      set({ financeEntries: data });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  addFinanceEntry: async (data) => {
    try {
      await api.post("/api/v1/life/finance", data);
      const entries = await api.get<FinanceEntry[]>("/api/v1/life/finance?limit=50");
      set({ financeEntries: entries });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  fetchFinanceSummary: async () => {
    try {
      const data = await api.get<FinanceSummary>("/api/v1/life/finance/summary");
      set({ financeSummary: data });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  // Health
  fetchHealth: async (metricType) => {
    try {
      const url = metricType
        ? `/api/v1/life/health?metric_type=${metricType}&limit=30`
        : "/api/v1/life/health?limit=30";
      const data = await api.get<HealthLog[]>(url);
      set({ healthLogs: data });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  logHealth: async (data) => {
    try {
      await api.post("/api/v1/life/health", data);
      const logs = await api.get<HealthLog[]>("/api/v1/life/health?limit=30");
      set({ healthLogs: logs });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },

  fetchHealthTrends: async () => {
    try {
      const data = await api.get<Record<string, { value: number; unit: string; date: string }[]>>(
        "/api/v1/life/health/trends"
      );
      set({ healthTrends: data });
    } catch (err) {
      set({ error: toErrorMessage(err) });
    }
  },
}));
