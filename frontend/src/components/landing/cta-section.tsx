"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function CtaSection() {
  return (
    <section className="py-32 px-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto glass-card rounded-[3rem] p-16 text-center border border-outline-variant/20 relative overflow-hidden"
      >
        {/* Ambient glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-athena-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-athena-secondary/10 rounded-full blur-[100px]" />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-4xl md:text-6xl font-headline font-bold mb-8 leading-tight relative z-10"
        >
          Ready to meet your <br /> new goddess?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-on-surface-variant text-lg mb-12 max-w-xl mx-auto relative z-10"
        >
          Join thousands of users who have automated their daily friction and
          reclaimed their time with AI-powered intelligence.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Link
            href="/signup"
            className="relative z-10 inline-block bg-athena-primary text-on-primary px-12 py-5 rounded-full font-headline text-lg uppercase tracking-widest font-bold shadow-2xl shadow-athena-primary/30 hover:scale-105 transition-all"
          >
            Initialize System
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
