import Link from "next/link";

const NAV_LINKS = [
  { label: "OS Architecture", href: "#features" },
  { label: "The Concierge", href: "#how-it-works" },
  { label: "Editorial", href: "#editorial" },
  { label: "Pricing", href: "#pricing" },
] as const;

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-xl bg-slate-950/60 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-8 py-6 max-w-screen-2xl mx-auto">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter text-slate-50 font-[var(--font-headline)] uppercase"
        >
          ATHENA
        </Link>

        <div className="hidden md:flex items-center space-x-10">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-[var(--font-headline)] tracking-tight text-sm uppercase font-medium text-slate-400 hover:text-slate-50 transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center space-x-6">
          <Link
            href="/login"
            className="text-slate-400 font-[var(--font-headline)] text-sm uppercase tracking-tight hover:text-slate-50 transition-all"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded-lg font-[var(--font-headline)] text-sm uppercase tracking-tight font-bold active:scale-95 duration-200 shadow-lg shadow-violet-500/20"
          >
            Get Access
          </Link>
        </div>
      </div>
    </nav>
  );
}
