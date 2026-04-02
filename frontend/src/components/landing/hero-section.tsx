"use client";

import Link from "next/link";
import { User, Brain } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function fadeUp(delay: number): Variants {
  return {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay, ease: EASE } },
  };
}

const SCALE_IN: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1, delay: 0.6, ease: EASE } },
};

export function HeroSection() {
  return (
    <section className="relative pt-40 pb-20 px-6 min-h-screen flex flex-col items-center justify-center hero-gradient overflow-hidden">
      {/* Top gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-athena-primary/10 via-transparent to-transparent -z-10 opacity-50" />

      <motion.div
        className="max-w-5xl text-center space-y-8 z-10"
        initial="hidden"
        animate="visible"
      >
        {/* Status badge */}
        <motion.div
          variants={fadeUp(0)}
          className="inline-flex items-center space-x-2 bg-surface-container-high/50 px-4 py-1.5 rounded-full border border-outline-variant/10 mb-4"
        >
          <span className="flex h-2 w-2 rounded-full bg-athena-secondary animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-athena-secondary">
            Neural Link Established
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp(0.15)}
          className="text-5xl md:text-8xl font-headline font-bold tracking-tighter text-on-surface leading-[0.9] md:leading-[1.1]"
        >
          The AI Goddess <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-athena-primary to-athena-secondary">
            That Runs Your Life
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={fadeUp(0.3)}
          className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed"
        >
          6 specialized AI agents. Voice-first. Browser control. Life
          management. One intelligent system.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUp(0.45)}
          className="flex flex-col sm:flex-row gap-6 justify-center mt-12"
        >
          <Link
            href="/signup"
            className="bg-primary-container text-on-primary-container px-10 py-5 rounded-xl font-headline text-lg uppercase tracking-tight font-bold shadow-2xl shadow-primary-container/40 hover:scale-[1.02] transition-transform active:scale-95"
          >
            Get Started Free
          </Link>
          <a
            href="#how-it-works"
            className="px-10 py-5 rounded-xl font-headline text-lg uppercase tracking-tight font-bold border border-outline-variant/30 hover:bg-surface-container-high transition-colors active:scale-95 inline-block"
          >
            See How It Works
          </a>
        </motion.div>
      </motion.div>

      {/* Hero Mockup */}
      <motion.div
        variants={SCALE_IN}
        initial="hidden"
        animate="visible"
        className="mt-24 w-full max-w-6xl mx-auto relative px-4"
      >
        <div className="glass-card p-4 rounded-2xl border border-outline-variant/10 shadow-2xl">
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-inner border border-outline-variant/5 relative">
            {/* Dashboard mockup with sidebar + chat */}
            <div className="flex h-full min-h-[360px]">
              {/* Mini sidebar */}
              <div className="hidden md:flex w-16 bg-[#0d1424] flex-col items-center py-4 gap-3 border-r border-white/5">
                <div className="w-8 h-8 rounded-full bg-athena-primary/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-athena-primary" />
                </div>
                <div className="w-6 h-[1px] bg-white/10 my-1" />
                <div className="w-8 h-8 rounded-lg bg-athena-primary/10 flex items-center justify-center"><User className="w-3.5 h-3.5 text-athena-primary" /></div>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><User className="w-3.5 h-3.5 text-slate-500" /></div>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><User className="w-3.5 h-3.5 text-slate-500" /></div>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><User className="w-3.5 h-3.5 text-slate-500" /></div>
              </div>

              {/* Chat area */}
              <div className="flex-1 flex flex-col p-6 gap-5 justify-end bg-gradient-to-b from-[#0b1326] to-[#0d1424]">
                {/* User message */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                  className="flex gap-3 items-start"
                >
                  <div className="w-8 h-8 rounded-full bg-athena-secondary/20 flex items-center justify-center border border-athena-secondary/30 shrink-0">
                    <User className="w-4 h-4 text-athena-secondary" />
                  </div>
                  <div className="bg-white/5 px-4 py-2.5 rounded-2xl rounded-tl-none border border-white/10 max-w-sm">
                    <p className="text-sm font-light leading-relaxed text-slate-300">
                      Plan my morning routine including the groceries for tonight&apos;s dinner.
                    </p>
                  </div>
                </motion.div>

                {/* Agent routing indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.4 }}
                  className="flex items-center gap-2 pl-11"
                >
                  <span className="text-[10px] font-mono uppercase tracking-widest text-athena-secondary">Scheduler + Life Coach activated</span>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-athena-secondary animate-pulse" />
                </motion.div>

                {/* AI response */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.8, duration: 0.6 }}
                  className="flex gap-3 items-start justify-end"
                >
                  <div className="bg-athena-primary/5 px-4 py-2.5 rounded-2xl rounded-tr-none border border-athena-primary/20 max-w-sm text-right">
                    <p className="text-sm font-light leading-relaxed text-athena-primary">
                      Done! Morning blocked for deep work, grocery list sent to your phone. Coffee at 7:00 AM.
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-athena-primary/20 flex items-center justify-center border border-athena-primary/40 relative shrink-0">
                    <Brain className="w-4 h-4 text-athena-primary" />
                    <div className="absolute -inset-1 rounded-full border border-athena-primary animate-ping opacity-20" />
                  </div>
                </motion.div>

                {/* Input bar mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.2, duration: 0.5 }}
                  className="bg-[#131b2e] rounded-xl border border-white/10 px-4 py-3 flex items-center gap-3"
                >
                  <span className="text-sm text-slate-500 flex-1">Message Athena...</span>
                  <div className="w-8 h-8 rounded-lg bg-athena-primary flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Accent Glows */}
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-athena-primary/20 rounded-full blur-[100px] -z-10" />
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-athena-secondary/20 rounded-full blur-[100px] -z-10" />
      </motion.div>
    </section>
  );
}
