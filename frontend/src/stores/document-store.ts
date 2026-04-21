/**
 * Zustand store for Documents — upload, list, delete, RAG query.
 */

import { create } from "zustand";
import { api } from "@/lib/api/client";
import { createClient } from "@/lib/supabase/client";

interface Document {
  id: string;
  filename: string;
  mime_type: string;
  file_size: number;
  status: "uploading" | "processing" | "ready" | "failed";
  chunk_count: number;
  created_at: string;
  processed_at: string | null;
}

interface QuerySource {
  document_id: string;
  filename: string;
  chunk_index: number;
  similarity: number;
}

interface DocumentState {
  documents: Document[];
  isUploading: boolean;
  isFetching: boolean;
  queryResults: { answer: string; sources: QuerySource[] } | null;
  isQuerying: boolean;
  error: string | null;

  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  queryDocuments: (query: string) => Promise<void>;
  clearError: () => void;
  clearQueryResults: () => void;
}

const toErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : "Something went wrong";

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  isUploading: false,
  isFetching: false,
  queryResults: null,
  isQuerying: false,
  error: null,

  clearError: () => set({ error: null }),
  clearQueryResults: () => set({ queryResults: null }),

  fetchDocuments: async () => {
    set({ isFetching: true });
    try {
      const data = await api.get<Document[]>("/api/v1/documents");
      set({ documents: data, isFetching: false });
    } catch (err) {
      set({ isFetching: false, error: toErrorMessage(err) });
    }
  },

  uploadDocument: async (file: File) => {
    set({ isUploading: true });
    try {
      // Use raw fetch with FormData — the JSON api client won't work for multipart
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const form = new FormData();
      form.append("file", file);

      const response = await fetch(`${apiBase}/api/v1/documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.detail || `Upload failed: ${response.status}`);
      }

      const body = await response.json();
      if (!body.success) throw new Error(body.error?.message || "Upload failed");

      // Add the new document (in processing state) optimistically
      const newDoc: Document = {
        id: body.data.id,
        filename: body.data.filename || file.name,
        mime_type: file.type,
        file_size: file.size,
        status: "processing",
        chunk_count: 0,
        created_at: new Date().toISOString(),
        processed_at: null,
      };

      set((s) => ({ documents: [newDoc, ...s.documents], isUploading: false }));
    } catch (err) {
      set({ isUploading: false, error: toErrorMessage(err) });
    }
  },

  deleteDocument: async (id: string) => {
    // Optimistic removal
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
    try {
      await api.delete(`/api/v1/documents/${id}`);
    } catch (err) {
      set({ error: toErrorMessage(err) });
      // Re-fetch to restore state on error
    }
  },

  queryDocuments: async (query: string) => {
    set({ isQuerying: true, queryResults: null });
    try {
      const data = await api.post<{ answer: string; sources: QuerySource[] }>(
        "/api/v1/documents/query",
        { query, top_k: 5 }
      );
      set({ queryResults: data, isQuerying: false });
    } catch (err) {
      set({ isQuerying: false, error: toErrorMessage(err) });
    }
  },
}));
