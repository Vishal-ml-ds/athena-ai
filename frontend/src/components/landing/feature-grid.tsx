"use client";

import { Brain, Mic, Globe, Heart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly description: string;
}

const FEATURES: ReadonlyArray<FeatureCardProps> = [
  {
    icon: Brain,
    title: "Multi-Agent Intelligence",
    description:
      "Six specialized agents working in perfect symphony to solve complex, multi-step requests across your life.",
  },
  {
    icon: Mic,
    title: "Voice-First",
    description:
      "Natural conversation without wake words. ATHENA understands context, emotion, and nuance in every command.",
  },
  {
    icon: Globe,
    title: "Browser Control",
    description:
      "ATHENA doesn't just talk. She browses, books, buys, and manages the web as if she had her own cursor.",
  },
  {
    icon: Heart,
    title: "Life OS",
    description:
      "Integrated tracking for habits, finances, and goals. ATHENA becomes the central nervous system of your success.",
  },
];

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }}
      className="glass-card p-8 rounded-2xl border border-outline-variant/10 hover:border-athena-primary/40 transition-all duration-500 group"
    >
      <div className="w-14 h-14 rounded-xl bg-surface-container-high flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-athena-primary" />
      </div>
      <h4 className="text-xl font-headline font-bold mb-4">
        {title}
      </h4>
      <p className="text-on-surface-variant font-light text-sm leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

export function FeatureGrid() {
  return (
    <section id="features" className="py-32 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <h2 className="text-sm font-mono tracking-[0.4em] uppercase text-athena-primary mb-4">
          Core Ecosystem
        </h2>
        <h3 className="text-4xl md:text-5xl font-headline font-medium">
          Architecture of Intelligence
        </h3>
      </div>
      <motion.div 
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </motion.div>
    </section>
  );
}
