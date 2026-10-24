import { BRAND, MARK } from "@/lib/brand";

/** The Clearline mark: a lab vessel with one level line across it. `empty` drops the liquid, for empty states. */
export function Logo({ size = 28, empty = false }: { size?: number; empty?: boolean }) {
  return (
    <svg width={size} height={size} viewBox={MARK.viewBox} aria-hidden="true">
      {!empty && <path d={MARK.liquid} fill={BRAND.accent} />}
      <path
        d={MARK.vessel}
        fill="none"
        stroke={BRAND.ink}
        strokeWidth={MARK.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
