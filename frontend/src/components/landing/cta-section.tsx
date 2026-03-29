import Link from "next/link";

export function CtaSection() {
  return (
    <section className="py-32 px-8">
      <div className="max-w-5xl mx-auto glass-card rounded-[3rem] p-16 text-center border border-outline-variant/20 relative overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-athena-primary/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-athena-secondary/10 rounded-full blur-[100px]" />

        <h2 className="text-4xl md:text-6xl font-[var(--font-headline)] font-bold mb-8 leading-tight relative z-10">
          Ready to meet your <br /> new goddess?
        </h2>
        <p className="text-on-surface-variant text-lg mb-12 max-w-xl mx-auto relative z-10">
          Join 15,000+ humans who have automated their daily friction and
          reclaimed their time.
        </p>
        <Link
          href="/signup"
          className="relative z-10 inline-block bg-athena-primary text-on-primary px-12 py-5 rounded-full font-[var(--font-headline)] text-lg uppercase tracking-widest font-bold shadow-2xl shadow-athena-primary/30 hover:scale-105 transition-all"
        >
          Initialize System
        </Link>
      </div>
    </section>
  );
}
