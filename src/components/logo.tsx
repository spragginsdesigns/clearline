/** A test well with a clear line through it. */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="13" fill="none" stroke="#a99dff" strokeWidth="2" strokeDasharray="2 3.1" />
      <circle cx="16" cy="16" r="7" fill="#a99dff" fillOpacity="0.18" stroke="#a99dff" strokeWidth="1.5" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="#f0efec" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
