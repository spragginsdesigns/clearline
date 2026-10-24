// Area scoping, shared by server pages and the client location picker. Pages that change with
// the area (home, substances, alerts) also live under /in/<area>/..., prerendered per area.
// Nothing here touches data/, so it is safe to import in client components.

/** Whether a page has a per-area version under /in/<area>. */
export function isScopable(path: string): boolean {
  const base = parseScope(path).base;
  return base === "/" || base === "/alerts" || base === "/substances" || base.startsWith("/substances/");
}

/** The same page for another area, or the all-areas version when `area` is null. */
export function scopedHref(path: string, area: string | null): string {
  const base = parseScope(path).base;
  if (!area || !isScopable(base)) return base;
  return base === "/" ? `/in/${area}` : `/in/${area}${base}`;
}

/** Splits "/in/portland-or/substances" into its area and the all-areas path. */
export function parseScope(path: string): { area: string | null; base: string } {
  const match = path.match(/^\/in\/([a-z0-9-]+)(\/.*)?$/);
  if (!match) return { area: null, base: path };
  return { area: match[1], base: match[2] ?? "/" };
}

export interface AreaPoint {
  slug: string;
  lat: number;
  lng: number;
}

/** Great-circle distance in miles. Runs on the person's device; their position is never sent anywhere. */
export function milesBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

export function nearest<T extends AreaPoint>(areas: T[], from: { lat: number; lng: number }): { area: T; miles: number } | null {
  let best: { area: T; miles: number } | null = null;
  for (const area of areas) {
    const miles = milesBetween(from, area);
    if (!best || miles < best.miles) best = { area, miles };
  }
  return best;
}

/** Further than this, we tell people we don't test near them yet instead of quietly picking an area. */
export const NEARBY_MILES = 120;

export const STORAGE_KEY = "clearline.area";
