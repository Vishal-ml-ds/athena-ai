"use client";

import {
  Shield,
  CreditCard,
  Calendar,
  Mail,
  Search,
  ShoppingCart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

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

const STEP_VARIANTS = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] },
  }),
};

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
          {/* Step 1 */}
          <motion.div
            variants={STEP_VARIANTS}
            custom={0}
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
            <div className="glass-card rounded-2xl overflow-hidden aspect-[4/3] border border-outline-variant/10">
              <div className="w-full h-full bg-gradient-to-br from-primary-container/20 via-surface-container to-athena-surface" />
            </div>
            <p className="text-on-surface-variant font-light">
              Initiate via voice or text. No complex prompts needed — ATHENA
              understands intent from natural language.
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            variants={STEP_VARIANTS}
            custom={1}
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
            <div className="glass-card rounded-2xl overflow-hidden aspect-[4/3] border border-outline-variant/10 flex items-center justify-center p-12">
              <div className="grid grid-cols-3 gap-6 w-full">
                {AGENT_ICONS.map(({ icon: Icon, colorClass, shouldPulse }, idx) => (
                  <motion.div
                    key={Icon.displayName}
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

          {/* Step 3 */}
          <motion.div
            variants={STEP_VARIANTS}
            custom={2}
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
            <div className="glass-card rounded-2xl overflow-hidden aspect-[4/3] border border-outline-variant/10">
              <div className="w-full h-full bg-gradient-to-br from-primary-container/20 via-surface-container to-athena-surface" />
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
