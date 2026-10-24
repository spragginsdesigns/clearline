// Hand-written SVG charts: no chart library, rendered on the server, readable
// without JavaScript. Hover tooltips use native <title> elements, and every
// chart has a table view next to it for screen readers and copy-paste.

import type { ReactNode } from "react";
import { percent } from "@/lib/format";

/** Median purity as an arc, with the middle half of samples (IQR) as a fainter arc outside it. */
export function PurityRing({
  median,
  q1,
  q3,
  color,
  size = 280,
  children,
}: {
  median: number;
  q1: number;
  q3: number;
  color: string;
  size?: number;
  children?: ReactNode;
}) {
  const inner = 42;
  const outer = 47;
  const circ = (r: number) => 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: "100%", maxWidth: size, aspectRatio: "1" }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" role="img" aria-label={`Median purity ${median}%, middle half of samples between ${q1}% and ${q3}%`}>
        <circle cx="50" cy="50" r={inner} fill="none" stroke="var(--color-grid)" strokeWidth="3" />
        <circle
          cx="50"
          cy="50"
          r={inner}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(median / 100) * circ(inner)} ${circ(inner)}`}
        >
          <title>{`Median ${median}%`}</title>
        </circle>
        <circle
          cx="50"
          cy="50"
          r={outer}
          fill="none"
          stroke={color}
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${((q3 - q1) / 100) * circ(outer)} ${circ(outer)}`}
          strokeDashoffset={-(q1 / 100) * circ(outer)}
        >
          <title>{`Middle half of samples: ${q1}% to ${q3}%`}</title>
        </circle>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/** Purity distribution in 5% bins, with the median marked. `compact` drops the axes for cards. */
export function Histogram({
  bins,
  median,
  color,
  compact = false,
}: {
  bins: number[];
  median: number;
  color: string;
  compact?: boolean;
}) {
  const W = 600;
  const H = compact ? 90 : 240;
  const pad = compact ? { l: 0, r: 0, t: 4, b: 0 } : { l: 40, r: 12, t: 32, b: 40 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;
  const max = Math.max(1, ...bins);
  const niceMax = compact ? max : Math.ceil(max / 10) * 10;
  const bw = plotW / bins.length;
  const x = (pct: number) => pad.l + (pct / 100) * plotW;
  const y = (n: number) => pad.t + plotH - (n / niceMax) * plotH;
  const yTicks = compact ? [] : [0, niceMax / 2, niceMax];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full overflow-visible"
      role="img"
      aria-label={`Purity distribution, median ${median}%`}
    >
      {yTicks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="var(--color-grid)" strokeWidth="1" />
          <text x={pad.l - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-ink-3 text-[15px] tabular-nums">
            {t}
          </text>
        </g>
      ))}
      {bins.map((n, i) =>
        n === 0 ? null : (
          <path
            key={i}
            d={bar(pad.l + i * bw + 1, y(n), bw - 2, y(0) - y(n), compact ? 2 : 3)}
            fill={color}
            fillOpacity={i * 5 <= median && median < i * 5 + 5 ? 1 : 0.72}
          >
            <title>{`${i * 5}-${i * 5 + 4}% purity: ${n} sample${n === 1 ? "" : "s"}`}</title>
          </path>
        ),
      )}
      <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke="var(--color-axis)" strokeWidth="1" />
      <line
        x1={x(median)}
        x2={x(median)}
        y1={pad.t - (compact ? 0 : 6)}
        y2={y(0)}
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      {!compact && (
        <>
          <text x={x(median)} y={pad.t - 14} textAnchor="middle" className="fill-ink text-[16px] font-medium">
            Median {median}%
          </text>
          {[0, 25, 50, 75, 100].map((t) => (
            <text key={t} x={x(t)} y={H - 12} textAnchor="middle" className="fill-ink-3 text-[15px] tabular-nums">
              {t}%
            </text>
          ))}
        </>
      )}
    </svg>
  );
}

/** A rect with only its top corners rounded, so bars sit flat on the baseline. */
function bar(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

/** Horizontal bars for "found in X% of samples". Items can co-occur, so these never sum to 100. */
export function BarList({
  items,
}: {
  items: { key: string; label: string; rate: number; count: number; color: string; note?: string }[];
}) {
  const max = Math.max(0.01, ...items.map((i) => i.rate));
  return (
    <ul className="space-y-3.5">
      {items.map((item) => (
        <li key={item.key} title={`${item.label}: found in ${item.count} samples`}>
          <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
            <span className="text-ink">
              {item.label}
              {item.note && <span className="ml-2 text-xs text-critical">{item.note}</span>}
            </span>
            <span className="tabular-nums text-ink-2">{percent(item.rate)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5">
            <div
              className="h-2 rounded-full"
              style={{ width: `${Math.max(1.5, (item.rate / max) * 100)}%`, background: item.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** 100% stacked bars, one per month, of what samples mostly turned out to be. */
export function StackedMonths({
  keys,
  rows,
  label,
  color,
}: {
  keys: string[];
  rows: { label: string; total: number; shares: Record<string, number> }[];
  label: (key: string) => string;
  color: (key: string) => string;
}) {
  return (
    <div>
      <ul className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2" aria-label="Legend">
        {keys.map((k) => (
          <li key={k} className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: color(k) }} />
            {label(k)}
          </li>
        ))}
      </ul>
      <div className="space-y-2.5">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[3rem_1fr_3.5rem] items-center gap-3 text-sm">
            <span className="text-ink-3">{row.label}</span>
            <div className="flex h-8 gap-[2px] overflow-hidden rounded-md">
              {keys.map((k) => {
                const share = row.shares[k] ?? 0;
                if (share === 0) return null;
                return (
                  <div
                    key={k}
                    className="flex items-center justify-center text-xs font-medium text-white"
                    style={{ width: `${share * 100}%`, background: color(k) }}
                    title={`${row.label}: ${label(k)} ${percent(share)}`}
                  >
                    {share >= 0.09 && <span className={share < 0.16 ? "hidden sm:inline" : undefined}>{percent(share)}</span>}
                  </div>
                );
              })}
            </div>
            <span className="text-right text-xs tabular-nums text-ink-3">n={row.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
