import type { ReactNode } from "react";
import { Logo } from "./logo";

/** A calm placeholder for when there is nothing to show yet, with the mark as an empty vessel. */
export function EmptyState({ title, children, compact = false }: { title: string; children?: ReactNode; compact?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed border-line-strong text-center ${compact ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12"}`}
    >
      <span className="opacity-60">
        <Logo size={compact ? 24 : 36} empty />
      </span>
      <p className={compact ? "text-sm text-ink-2" : "font-display text-2xl"}>{title}</p>
      {children && <div className="max-w-md text-sm text-ink-3">{children}</div>}
    </div>
  );
}
