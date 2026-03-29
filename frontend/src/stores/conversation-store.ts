/**
 * Zustand store for conversation state.
 * Manages conversations, messages, and streaming state.
 */

import { create } from "zustand";
import { api, streamMessage } from "@/lib/api/client";

interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  agentName?: string;
  tokensUsed?: number;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  agentType: string;
  createdAt: string;
  updatedAt: string;
}

interface ConversationState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  activeAgent: string | null;

  // Actions
  fetchConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<string>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  streamingContent: "",
  activeAgent: null,

  fetchConversations: async () => {
    set({ isLoading: true });
    try {
      const data = await api.get<Conversation[]>("/api/v1/conversations");
      set({ conversations: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createConversation: async (title = "New Conversation") => {
    const data = await api.post<Conversation>("/api/v1/conversations", { title });
    set((state) => ({
      conversations: [data, ...state.conversations],
      activeConversationId: data.id,
      messages: [],
    }));
    return data.id;
  },

  selectConversation: async (id: string) => {
    set({ isLoading: true, activeConversationId: id });
    try {
      const data = await api.get<{
        id: string;
        title: string;
        agentType: string;
        messages: Message[];
        createdAt: string;
        updatedAt: string;
      }>(`/api/v1/conversations/${id}`);
      set({ messages: data.messages, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  sendMessage: async (content: string) => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    // Add user message optimistically
    const userMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: activeConversationId,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isStreaming: true,
      streamingContent: "",
      activeAgent: null,
    }));

    try {
      let fullContent = "";
      let agentName = "general";

      for await (const event of streamMessage(activeConversationId, content)) {
        const type = event.type as string;

        if (type === "agent_start") {
          set({ activeAgent: event.agent as string });
        } else if (type === "classification") {
          agentName = event.primary_agent as string;
          set({ activeAgent: agentName });
        } else if (type === "token") {
          fullContent += event.content as string;
          set({ streamingContent: fullContent });
        } else if (type === "done") {
          const assistantMessage: Message = {
            id: (event.message_id as string) || crypto.randomUUID(),
            conversationId: activeConversationId,
            role: "assistant",
            content: fullContent,
            agentName,
            createdAt: new Date().toISOString(),
          };

          set((state) => ({
            messages: [...state.messages, assistantMessage],
            isStreaming: false,
            streamingContent: "",
            activeAgent: null,
          }));
        } else if (type === "agent_end") {
          agentName = event.agent as string;
        }
      }
    } catch {
      set({ isStreaming: false, streamingContent: "", activeAgent: null });
    }
  },

  deleteConversation: async (id: string) => {
    await api.delete(`/api/v1/conversations/${id}`);
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversationId:
        state.activeConversationId === id ? null : state.activeConversationId,
      messages: state.activeConversationId === id ? [] : state.messages,
    }));
  },
}));
