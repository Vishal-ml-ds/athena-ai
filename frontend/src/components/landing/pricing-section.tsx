"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface PricingFeature {
  readonly label: string;
}

interface PricingTierProps {
  readonly name: string;
  readonly price: string;
  readonly features: ReadonlyArray<PricingFeature>;
  readonly ctaLabel: string;
  readonly isHighlighted?: boolean;
  readonly tierColorClass: string;
  readonly checkColorClass: string;
  readonly buttonClass: string;
}

const PRICING_TIERS: ReadonlyArray<PricingTierProps> = [
  {
    name: "Free",
    price: "$0",
    tierColorClass: "text-on-surface-variant",
    checkColorClass: "text-athena-primary",
    features: [
      { label: "2 AI Agents Active" },
      { label: "Basic Voice Commands" },
      { label: "Sync with 2 Devices" },
    ],
    ctaLabel: "Start Free",
    buttonClass:
      "w-full py-4 rounded-xl border border-outline-variant/30 hover:bg-surface-container-high transition-colors font-headline uppercase tracking-tight font-bold",
  },
  {
    name: "Pro",
    price: "$29",
    tierColorClass: "text-athena-primary",
    checkColorClass: "text-athena-primary",
    isHighlighted: true,
    features: [
      { label: "All 6 AI Agents" },
      { label: "Advanced Browser Control" },
      { label: "Unlimited Devices" },
      { label: "Priority Agency Queue" },
    ],
    ctaLabel: "Upgrade to Pro",
    buttonClass:
      "w-full py-4 rounded-xl bg-primary-container text-on-primary-container font-headline uppercase tracking-tight font-bold shadow-lg shadow-primary-container/20",
  },
  {
    name: "Ultra",
    price: "$79",
    tierColorClass: "text-athena-secondary",
    checkColorClass: "text-athena-secondary",
    features: [
      { label: "Customizable Agents" },
      { label: "Full Finance API Access" },
      { label: "Dedicated Concierge Proxy" },
      { label: "Zero-Knowledge Encryption" },
    ],
    ctaLabel: "Go Ultra",
    buttonClass:
      "w-full py-4 rounded-xl border border-athena-secondary/30 text-athena-secondary hover:bg-athena-secondary/10 transition-colors font-headline uppercase tracking-tight font-bold",
  },
];

function PricingCard({
  name,
  price,
  features,
  ctaLabel,
  isHighlighted,
  tierColorClass,
  checkColorClass,
  buttonClass,
}: PricingTierProps) {
  return (
    <div
      className={`glass-card p-10 rounded-3xl flex flex-col ${isHighlighted
          ? "border-2 border-primary-container relative shadow-[0_0_50px_rgba(124,58,237,0.15)]"
          : "border border-outline-variant/10"
        }`}
    >
      {isHighlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
          Most Popular
        </div>
      )}
      <div className="mb-8">
        <h4
          className={`text-xl font-headline font-medium uppercase tracking-widest ${tierColorClass}`}
        >
          {name}
        </h4>
        <div className="mt-4 flex items-baseline">
          <span className="text-5xl font-headline font-bold">
            {price}
          </span>
          <span className="text-on-surface-variant ml-2">/mo</span>
        </div>
      </div>
      <ul className="space-y-4 flex-1">
        {features.map((feature) => (
          <li
            key={feature.label}
            className="flex items-center gap-3 text-sm font-light"
          >
            <CheckCircle className={`w-[18px] h-[18px] shrink-0 ${checkColorClass}`} />
            {feature.label}
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <Link href="/signup" className={`block text-center ${buttonClass}`} data-testid={`pricing-cta-${name.toLowerCase()}`}>
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-24">
        <h2 className="text-sm font-mono tracking-[0.4em] uppercase text-athena-primary mb-4">
          Investment
        </h2>
        <h3 className="text-4xl md:text-5xl font-headline font-medium">
          Power for Every Lifestyle
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PRICING_TIERS.map((tier, i) => (
          <motion.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <PricingCard {...tier} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
