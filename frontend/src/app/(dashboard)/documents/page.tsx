"use client";

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
  Construction,
} from "lucide-react";

// --- Types ---

type DocumentStatus = "processing" | "ready" | "failed";

interface DocumentItem {
  id: string;
  name: string;
  size: string;
  date: string;
  status: DocumentStatus;
  icon: "pdf" | "image" | "audio" | "error" | "text" | "spreadsheet";
}

// --- Constants ---

const ICON_MAP = {
  pdf: { Icon: FileText, color: "text-[#ffb95f]", bg: "bg-[#ffb95f]/10" },
  image: { Icon: Image, color: "text-[#d2bbff]", bg: "bg-[#d2bbff]/10" },
  audio: { Icon: AudioLines, color: "text-[#d2bbff]", bg: "bg-[#d2bbff]/10" },
  error: { Icon: AlertCircle, color: "text-[#ffb4ab]", bg: "bg-[#ffb4ab]/10" },
  text: { Icon: File, color: "text-[#d2bbff]", bg: "bg-[#d2bbff]/10" },
  spreadsheet: { Icon: Table2, color: "text-[#ffb95f]", bg: "bg-[#ffb95f]/10" },
} as const;

const STATUS_STYLES: Record<DocumentStatus, { dot: string; text: string; label: string }> = {
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

const DEMO_DOCUMENTS: DocumentItem[] = [
  { id: "1", name: "market_analysis_2024.pdf", size: "4.2 MB", date: "Oct 12, 2023", status: "processing", icon: "pdf" },
  { id: "2", name: "infrastructure_blueprint.png", size: "12.8 MB", date: "Oct 11, 2023", status: "ready", icon: "image" },
  { id: "3", name: "board_meeting_q3.mp3", size: "45.0 MB", date: "Oct 10, 2023", status: "ready", icon: "audio" },
  { id: "4", name: "corrupted_log_final.csv", size: "0.1 MB", date: "Oct 09, 2023", status: "failed", icon: "error" },
  { id: "5", name: "athena_manifesto.txt", size: "0.8 MB", date: "Oct 08, 2023", status: "ready", icon: "text" },
  { id: "6", name: "revenue_forecast.xlsx", size: "2.1 MB", date: "Oct 08, 2023", status: "processing", icon: "spreadsheet" },
];

const TOTAL_OBJECTS = DEMO_DOCUMENTS.length;

// --- Sub-components ---

function UploadZone() {
  const handleUploadClick = () => {
    toast.info("Document processing coming in next update", {
      description: "Upload and RAG indexing are being built.",
      icon: <Construction className="h-4 w-4" />,
    });
  };

  return (
    <section>
      <div className="relative">
        <div
          onClick={handleUploadClick}
          className="w-full h-[200px] rounded-2xl border-2 border-dashed border-purple-500/30 bg-[rgba(30,41,59,0.4)] backdrop-blur-xl flex flex-col items-center justify-center group cursor-pointer hover:border-purple-500 hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)] transition-all duration-500"
          data-testid="upload-zone"
        >
          <div className="w-14 h-14 rounded-full bg-[#d2bbff]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CloudUpload className="h-8 w-8 text-[#d2bbff]" />
          </div>
          <h3 className="text-white font-medium text-lg">Drag files here or click to upload</h3>
          <p className="text-slate-400 text-sm mt-1">Supports PDF, images, audio</p>
        </div>
        {/* Coming Soon overlay badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#ffb95f]/10 border border-[#ffb95f]/30">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#ffb95f] font-bold">
            Coming Soon
          </span>
        </div>
      </div>
    </section>
  );
}

function DocumentCard({ doc }: { doc: DocumentItem }) {
  const iconConfig = ICON_MAP[doc.icon];
  const statusStyle = STATUS_STYLES[doc.status];
  const { Icon } = iconConfig;

  const handleDelete = () => {
    toast.info("Document management coming in next update");
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
          <h4 className="text-white font-bold truncate pr-6">{doc.name}</h4>
          <p className="text-slate-500 text-xs mt-1">
            {doc.size} -- {doc.date}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
            <span className={`text-[10px] font-mono uppercase tracking-tighter ${statusStyle.text}`}>
              {statusStyle.label}
            </span>
          </div>
        </div>
      </div>
      {/* Demo Data badge */}
      <div className="absolute bottom-3 right-3">
        <span className="text-[8px] font-mono uppercase tracking-widest text-slate-600 bg-slate-800/60 px-2 py-0.5 rounded">
          Demo Data
        </span>
      </div>
    </div>
  );
}

function QueryBar() {
  const handleQuery = () => {
    toast.info("RAG query coming in next update", {
      description: "Document search and Q&A are being built.",
      icon: <Construction className="h-4 w-4" />,
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-8 flex justify-center z-50">
      <div className="w-full max-w-3xl flex items-center gap-4 bg-slate-900/80 backdrop-blur-2xl p-2 pl-6 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group focus-within:border-[#d2bbff]/40 transition-all">
        <Sparkles className="h-5 w-5 text-slate-500" />
        <input
          className="flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-slate-500 text-sm py-3 outline-none"
          placeholder="Ask a question about your documents..."
          type="text"
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
          className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#d2bbff] rounded-full flex items-center justify-center text-white hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all active:scale-95"
          data-testid="rag-query-submit"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// --- Page ---

export default function DocumentsPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#0F172A] pb-32 relative">
      <div className="max-w-6xl mx-auto px-8 py-8 space-y-12">
        <UploadZone />

        {/* Document Library */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-headline font-bold text-white tracking-tight">
              Document Library
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-[#ffb95f]/10 rounded-full text-[10px] font-mono text-[#ffb95f] uppercase tracking-widest border border-[#ffb95f]/20 font-bold">
                Demo Data
              </span>
              <span className="px-3 py-1 bg-[#171f33] rounded-full text-[10px] font-mono text-[#d2bbff] uppercase tracking-widest border border-[#d2bbff]/10">
                {TOTAL_OBJECTS} Total Objects
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_DOCUMENTS.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </div>
        </section>
      </div>

      <QueryBar />

      {/* Background glows */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#d2bbff]/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-[#ffb95f]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
