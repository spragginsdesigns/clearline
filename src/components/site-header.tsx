import Link from "next/link";
import { areas } from "@/lib/data";
import { LocationPicker, ScopedLink } from "./location-picker";
import { Logo } from "./logo";

const NAV = [
  { href: "/substances", label: "Substances" },
  { href: "/alerts", label: "Alerts" },
  { href: "/methods", label: "How we test" },
  { href: "/data", label: "Open data" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-5 sm:px-6">
      <ScopedLink href="/" className="flex items-center gap-2.5" aria-label="Clearline home">
        <Logo />
        <span className="text-xl font-medium tracking-tight">Clearline</span>
      </ScopedLink>
      <nav aria-label="Main" className="order-4 -mx-2 flex w-full justify-between overflow-x-auto text-sm [scrollbar-width:none] lg:order-none lg:mx-0 lg:w-auto lg:justify-start lg:gap-1">
        {NAV.map((item) => (
          <ScopedLink
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full px-2 py-1.5 text-ink-2 transition hover:bg-white/5 hover:text-ink sm:px-3"
          >
            {item.label}
          </ScopedLink>
        ))}
      </nav>
      <div className="order-3 w-full sm:order-none sm:ml-auto sm:w-auto lg:ml-0">
        {/* Only what the picker needs, so the sample data stays out of the client bundle. */}
        <LocationPicker areas={areas.map(({ slug, name, region, lat, lng }) => ({ slug, name, region, lat, lng }))} />
      </div>
      <Link
        href="/check"
        className="rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium transition hover:border-accent hover:text-accent"
      >
        Check a result
      </Link>
    </header>
  );
}
