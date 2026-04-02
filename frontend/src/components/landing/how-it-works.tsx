"use client";

import {
  Shield,
  CreditCard,
  Calendar,
  Mail,
  Search,
  ShoppingCart,
  MessageSquare,
  Mic,
  Brain,
  FileText,
  BarChart3,
  CheckCircle,
  Zap,
  Globe,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, type Variants } from "framer-motion";

interface AgentIconProps {
  readonly icon: LucideIcon;
  readonly colorClass: string;
  readonly shouldPulse?: boolean;
}

const AGENT_ICONS: ReadonlyArray<AgentIconProps> = [
  { icon: Shield, colorClass: "text-athena-primary", shouldPulse: true },
  { icon: CreditCard, colorClass: "text-athena-secondary" },
  { icon: Calendar, colorClass: "text-athena-primary" },
  { icon: Mail, colorClass: "text-athena-secondary" },
  { icon: Search, colorClass: "text-athena-primary", shouldPulse: true },
  { icon: ShoppingCart, colorClass: "text-athena-secondary" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function stepVariants(i: number): Variants {
  return {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.2, ease: EASE } },
  };
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-surface-container-lowest/50">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8"
        >
          <div className="max-w-xl">
            <h2 className="text-sm font-mono tracking-[0.4em] uppercase text-athena-secondary mb-4">
              Workflow Optimization
            </h2>
            <h3 className="text-4xl md:text-5xl font-headline font-medium">
              From Thought to Execution
            </h3>
          </div>
          <p className="text-on-surface-variant max-w-sm mb-2">
            A three-phase process that turns a simple command into a complex
            operational victory.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
          {/* Step 1 — Ask Anything */}
          <motion.div
            variants={stepVariants(0)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative space-y-8"
          >
            <div className="flex items-center gap-6">
              <span className="w-12 h-12 rounded-full border border-athena-primary/40 flex items-center justify-center font-headline text-xl font-bold text-athena-primary">
                01
              </span>
              <h4 className="text-2xl font-headline font-bold">
                Ask Anything
              </h4>
            </div>
            {/* Visual: Chat interface mockup */}
            <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-athena-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-athena-primary" />
                </div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Chat Interface</span>
              </div>
              <div className="bg-surface-container-lowest/50 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <Mic className="w-3.5 h-3.5 text-athena-secondary" />
                  <span className="italic">&ldquo;Plan my morning routine&rdquo;</span>
                </div>
              </div>
              <div className="bg-athena-primary/5 border border-athena-primary/10 rounded-xl p-3">
                <div className="flex items-start gap-2 text-sm text-athena-primary">
                  <Brain className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>Analyzing intent... routing to Scheduler + Life Coach agents</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-athena-primary/10 text-athena-primary">Voice</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-athena-secondary/10 text-athena-secondary">Text</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Natural Language</span>
              </div>
            </div>
            <p className="text-on-surface-variant font-light">
              Initiate via voice or text. No complex prompts needed — ATHENA
              understands intent from natural language.
            </p>
          </motion.div>

          {/* Step 2 — Parallel Agency */}
          <motion.div
            variants={stepVariants(1)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative space-y-8"
          >
            <div className="flex items-center gap-6">
              <span className="w-12 h-12 rounded-full border border-athena-primary/40 flex items-center justify-center font-headline text-xl font-bold text-athena-primary">
                02
              </span>
              <h4 className="text-2xl font-headline font-bold">
                Parallel Agency
              </h4>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10 flex items-center justify-center p-12">
              <div className="grid grid-cols-3 gap-6 w-full">
                {AGENT_ICONS.map(({ icon: Icon, colorClass, shouldPulse }, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + idx * 0.1, duration: 0.4 }}
                    className={`w-full aspect-square rounded-lg bg-surface-container-high flex items-center justify-center ${shouldPulse ? "animate-pulse" : ""}`}
                  >
                    <Icon className={`w-6 h-6 ${colorClass}`} />
                  </motion.div>
                ))}
              </div>
            </div>
            <p className="text-on-surface-variant font-light">
              Six specialized agents (Researcher, Scheduler, Life Coach, Coder,
              Browser, Finance) collaborate simultaneously.
            </p>
          </motion.div>

          {/* Step 3 — Intelligent Results */}
          <motion.div
            variants={stepVariants(2)}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative space-y-8"
          >
            <div className="flex items-center gap-6">
              <span className="w-12 h-12 rounded-full border border-athena-primary/40 flex items-center justify-center font-headline text-xl font-bold text-athena-primary">
                03
              </span>
              <h4 className="text-2xl font-headline font-bold">
                Intelligent Results
              </h4>
            </div>
            {/* Visual: Results dashboard mockup */}
            <div className="glass-card rounded-2xl overflow-hidden border border-outline-variant/10 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Results Hub</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-surface-container-lowest/50 rounded-lg p-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-on-surface-variant">Morning schedule optimized</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-container-lowest/50 rounded-lg p-2.5">
                  <FileText className="w-4 h-4 text-athena-primary shrink-0" />
                  <span className="text-sm text-on-surface-variant">Grocery list generated</span>
                </div>
                <div className="flex items-center gap-3 bg-surface-container-lowest/50 rounded-lg p-2.5">
                  <BarChart3 className="w-4 h-4 text-athena-secondary shrink-0" />
                  <span className="text-sm text-on-surface-variant">Budget impact: Rs 450</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">3 actions</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-athena-primary/10 text-athena-primary">1.2s</span>
              </div>
            </div>
            <p className="text-on-surface-variant font-light">
              Receive finalized actions, comprehensive reports, or confirmed
              bookings directly in your hub.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
