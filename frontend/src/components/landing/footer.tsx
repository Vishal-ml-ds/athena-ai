import Link from "next/link";

const FOOTER_NAV = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
] as const;

const FOOTER_COMPANY = [
  { label: "Sign Up", href: "/signup" },
  { label: "Login", href: "/login" },
  { label: "Documentation", href: "#features" },
] as const;

const FOOTER_STATUS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "System Status", href: "#" },
] as const;

interface FooterColumnProps {
  readonly title: string;
  readonly links: ReadonlyArray<{ readonly label: string; readonly href: string }>;
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h5 className="font-mono text-[11px] uppercase tracking-[0.2em] text-violet-400 mb-6">
        {title}
      </h5>
      <div className="flex flex-col space-y-4">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="font-mono text-[11px] uppercase tracking-widest text-slate-500 hover:text-violet-400 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full pt-24 pb-12 bg-slate-950">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto">
        <div className="md:col-span-1">
          <div className="text-lg font-headline font-bold text-slate-300 mb-6 uppercase tracking-tighter">
            ATHENA
          </div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500 leading-relaxed">
            Defining the celestial intelligence through seamless OS integration.
          </p>
        </div>
        <FooterColumn title="Navigation" links={FOOTER_NAV} />
        <FooterColumn title="Company" links={FOOTER_COMPANY} />
        <FooterColumn title="Status" links={FOOTER_STATUS} />
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-500">
          {new Date().getFullYear()} ATHENA AI OS. DEFINING THE CELESTIAL INTELLIGENCE.
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-slate-600">
          Crafted with <span className="text-violet-400">celestial precision</span>
        </p>
      </div>
    </footer>
  );
}
