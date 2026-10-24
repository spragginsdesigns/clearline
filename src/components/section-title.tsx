import Link from "next/link";
import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  href,
  link,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  link?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.2em] text-ink-3">{eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="shrink-0 text-sm text-ink-2 hover:text-ink">
          {link} →
        </Link>
      )}
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-12 max-w-3xl pt-8">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-ink-3">{eyebrow}</p>
      <h1 className="font-display text-5xl leading-none sm:text-6xl">{title}</h1>
      {children && <div className="mt-5 text-lg text-ink-2">{children}</div>}
    </div>
  );
}
