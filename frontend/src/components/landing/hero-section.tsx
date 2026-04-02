"use client";

import Link from "next/link";
import { User, Brain } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
  },
});

const SCALE_IN = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
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
          <button className="px-10 py-5 rounded-xl font-headline text-lg uppercase tracking-tight font-bold border border-outline-variant/30 hover:bg-surface-container-high transition-colors active:scale-95">
            Watch Demo
          </button>
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
          <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-inner border border-outline-variant/5 aspect-video relative">
            {/* Gradient placeholder */}
            <div className="w-full h-full bg-gradient-to-br from-primary-container/20 via-surface-container to-athena-surface" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-transparent to-transparent" />

            {/* Floating Chat Elements */}
            <div className="absolute bottom-12 left-12 right-12 flex-col gap-4 hidden md:flex">
              {/* User message */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="flex gap-4 items-start"
              >
                <div className="w-10 h-10 rounded-full bg-athena-secondary/20 flex items-center justify-center border border-athena-secondary/30">
                  <User className="w-5 h-5 text-athena-secondary" />
                </div>
                <div className="glass-card px-6 py-3 rounded-2xl rounded-tl-none border border-outline-variant/20 max-w-md">
                  <p className="text-sm font-light leading-relaxed">
                    Athena, plan my morning routine including the groceries for
                    tonight&apos;s dinner.
                  </p>
                </div>
              </motion.div>

              {/* AI response */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 0.6 }}
                className="flex gap-4 items-start justify-end"
              >
                <div className="glass-card px-6 py-3 rounded-2xl rounded-tr-none border border-athena-primary/20 bg-primary-container/10 max-w-md text-right">
                  <p className="text-sm font-light leading-relaxed text-athena-primary">
                    Integrating your calendar with Whole Foods. The Kitchen Agent
                    has updated your list. Coffee brewing sequence initiated for
                    7:00 AM.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-athena-primary/20 flex items-center justify-center border border-athena-primary/40 relative">
                  <Brain className="w-5 h-5 text-athena-primary" />
                  <div className="absolute -inset-1 rounded-full border border-athena-primary animate-ping opacity-20" />
                </div>
              </motion.div>
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
