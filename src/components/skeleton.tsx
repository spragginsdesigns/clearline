/** A placeholder block with a slow shimmer. Motion stops for people who ask for reduced motion. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-white/[0.06] motion-reduce:animate-none ${className}`}
    />
  );
}
