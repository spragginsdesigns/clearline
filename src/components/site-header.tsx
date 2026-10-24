import Link from "next/link";
import { Logo } from "./logo";

const NAV = [
  { href: "/substances", label: "Substances" },
  { href: "/alerts", label: "Alerts" },
  { href: "/methods", label: "How we test" },
  { href: "/data", label: "Open data" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-5 sm:px-6">
      <Link href="/" className="flex items-center gap-2.5" aria-label="Clearline home">
        <Logo />
        <span className="text-xl font-medium tracking-tight">Clearline</span>
      </Link>
      <nav aria-label="Main" className="order-3 -mx-2 flex w-full justify-between overflow-x-auto text-sm [scrollbar-width:none] sm:order-none sm:mx-0 sm:w-auto sm:justify-start sm:gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full px-2 py-1.5 sm:px-3 text-ink-2 transition hover:bg-white/5 hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Link
        href="/check"
        className="rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium transition hover:border-accent hover:text-accent"
      >
        Check a result
      </Link>
    </header>
  );
}
