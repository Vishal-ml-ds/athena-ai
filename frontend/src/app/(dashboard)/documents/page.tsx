"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CloudUpload,
  FileText,
  Image,
  AudioLines,
  AlertCircle,
  Table2,
  File,
  Trash2,
  Sparkles,
  Send,
  Loader2,
  X,
} from "lucide-react";
import { useDocumentStore } from "@/stores/document-store";

// --- Types ---

type DocumentStatus = "uploading" | "processing" | "ready" | "failed";

// --- Constants ---

const ICON_MAP = {
  "application/pdf": { Icon: FileText, color: "text-[#ffb95f]", bg: "bg-[#ffb95f]/10" },
  "image/png": { Icon: Image, color: "text-[#d2bbff]", bg: "bg-[#d2bbff]/10" },
  "image/jpeg": { Icon: Image, color: "text-[#d2bbff]", bg: "bg-[#d2bbff]/10" },
  "audio/mpeg": { Icon: AudioLines, color: "text-[#d2bbff]", bg: "bg-[#d2bbff]/10" },
  "text/csv": { Icon: Table2, color: "text-[#ffb95f]", bg: "bg-[#ffb95f]/10" },
  default: { Icon: File, color: "text-[#d2bbff]", bg: "bg-[#d2bbff]/10" },
} as const;

const STATUS_STYLES: Record<DocumentStatus, { dot: string; text: string; label: string }> = {
  uploading: {
    dot: "bg-blue-400 animate-pulse",
    text: "text-blue-400",
    label: "Uploading",
  },
  processing: {
    dot: "bg-[#ffb95f] animate-pulse shadow-[0_0_8px_rgba(255,185,95,0.8)]",
    text: "text-[#ffb95f]",
    label: "Processing",
  },
  ready: {
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    label: "Ready",
  },
  failed: {
    dot: "bg-rose-500",
    text: "text-rose-500",
    label: "Failed",
  },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// --- Sub-components ---

function UploadZone({ onFileSelect }: { onFileSelect: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isUploading } = useDocumentStore();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <section>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md,.csv,.json"
        className="hidden"
        data-testid="upload-file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
          e.target.value = "";
        }}
      />
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="w-full h-[200px] rounded-2xl border-2 border-dashed border-purple-500/30 bg-[rgba(30,41,59,0.4)] backdrop-blur-xl flex flex-col items-center justify-center group cursor-pointer hover:border-purple-500 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)] transition-all duration-500"
        data-testid="upload-zone"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 text-[#d2bbff] animate-spin mb-4" />
            <p className="text-white font-medium">Uploading...</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-[#d2bbff]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CloudUpload className="h-8 w-8 text-[#d2bbff]" />
            </div>
            <h3 className="text-white font-medium text-lg">Drag files here or click to upload</h3>
            <p className="text-slate-400 text-sm mt-1">Supports PDF, TXT, MD, CSV, JSON (max 50 MB)</p>
          </>
        )}
      </div>
    </section>
  );
}

function DocumentCard({ doc }: {
  doc: { id: string; filename: string; mime_type: string; file_size: number; status: DocumentStatus; created_at: string };
}) {
  const deleteDocument = useDocumentStore((s) => s.deleteDocument);
  const iconConfig = ICON_MAP[doc.mime_type as keyof typeof ICON_MAP] ?? ICON_MAP.default;
  const statusStyle = STATUS_STYLES[doc.status];
  const { Icon } = iconConfig;

  const handleDelete = () => {
    deleteDocument(doc.id);
    toast.success("Document deleted");
  };

  return (
    <div className="relative group p-5 bg-[rgba(30,41,59,0.4)] backdrop-blur-xl rounded-xl border border-white/5 hover:border-[#d2bbff]/20 transition-all">
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-[#ffb4ab]"
        data-testid={`delete-doc-${doc.id}`}
      >
        <Trash2 className="h-5 w-5" />
      </button>
      <div className="flex items-start gap-4">
        <div className={`p-3 ${iconConfig.bg} rounded-lg`}>
          <Icon className={`h-5 w-5 ${iconConfig.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold truncate pr-6">{doc.filename}</h4>
          <p className="text-slate-500 text-xs mt-1">
            {formatBytes(doc.file_size)} · {new Date(doc.created_at).toLocaleDateString()}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
            <span className={`text-[10px] font-mono uppercase tracking-tighter ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QueryResults({ onClose }: { onClose: () => void }) {
  const { queryResults } = useDocumentStore();
  if (!queryResults) return null;

  return (
    <div className="mx-8 mb-6 bg-[#131b2e] rounded-2xl border border-[#d2bbff]/20 p-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
      <h3 className="text-[#d2bbff] font-mono text-xs uppercase tracking-widest mb-4">Answer</h3>
      <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{queryResults.answer}</p>
      {queryResults.sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-2">Sources</p>
          <div className="flex flex-wrap gap-2">
            {queryResults.sources.map((s, i) => (
              <span
                key={i}
                className="text-xs bg-[#ffb95f]/10 text-[#ffb95f] border border-[#ffb95f]/20 px-2 py-1 rounded-full"
              >
                {s.filename} ({Math.round(s.similarity * 100)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QueryBar() {
  const [query, setQuery] = useState("");
  const { queryDocuments, isQuerying } = useDocumentStore();

  const handleQuery = () => {
    if (!query.trim() || isQuerying) return;
    queryDocuments(query.trim());
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-center z-50">
      <div className="w-full max-w-3xl flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl p-2 pl-6 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-[#d2bbff]/40 transition-all">
        <Sparkles className="h-5 w-5 text-slate-500 shrink-0" />
        <input
          className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-slate-500 text-sm py-3 outline-none"
          placeholder="Ask a question about your documents..."
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          data-testid="rag-query-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleQuery();
            }
          }}
        />
        <button
          onClick={handleQuery}
          disabled={isQuerying || !query.trim()}
          className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#d2bbff] rounded-full flex items-center justify-center text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all active:scale-95 disabled:opacity-50"
          data-testid="rag-query-submit"
        >
          {isQuerying ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

// --- Page ---

export default function DocumentsPage() {
  const { documents, isFetching, fetchDocuments, uploadDocument, error, clearError, clearQueryResults, queryResults } = useDocumentStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleFileSelect = (file: File) => {
    uploadDocument(file).then(() => {
      toast.success("Document uploaded", { description: "Processing in background..." });
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0F172A] pb-32 relative">
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-12">
        <UploadZone onFileSelect={handleFileSelect} />

        {queryResults && (
          <QueryResults onClose={clearQueryResults} />
        )}

        {/* Document Library */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight">
              Document Library
            </h2>
            <span className="px-3 py-1 bg-[#171f33] rounded-full text-[10px] font-mono text-[#d2bbff] uppercase tracking-widest border border-[#d2bbff]/10">
              {documents.length} Total Objects
            </span>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 text-[#d2bbff] animate-spin" />
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <File className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-sm">No documents yet. Upload one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          )}
        </section>
      </div>

      <QueryBar />

      {/* Background glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#d2bbff]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#ffb95f]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
