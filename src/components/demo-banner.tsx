import { isDemo } from "@/lib/data";

/** Shown on every page while data/ holds generated data, so no one mistakes it for real results. */
export function DemoBanner() {
  if (!isDemo) return null;
  return (
    <div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-sm text-warning">
      <strong className="font-semibold">Demo data.</strong> Every result on this site is generated for design and
      development. Nothing here is a real lab result.
    </div>
  );
}
