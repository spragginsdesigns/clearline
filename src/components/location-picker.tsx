"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { isScopable, NEARBY_MILES, nearest, parseScope, scopedHref, STORAGE_KEY } from "@/lib/scope";
import type { Area } from "@/lib/types";

// The area picker in the header. Location never leaves the device: the browser hands us a position,
// we find the nearest area right here, and only the area's slug is kept (in localStorage).

const OPEN_EVENT = "clearline:pick-area";
/** Stored when someone picks "All areas", so we stop sending them to a saved area. */
const ALL = "all";

type Locate =
  | { state: "idle" }
  | { state: "locating" }
  | { state: "far"; area: Area; miles: number }
  | { state: "error"; message: string };

function readSaved(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function save(value: string) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private windows can block storage. Picking still works for this visit.
  }
}

/** Opens the header picker from anywhere on the page. */
export function PickAreaButton({ children = "Choose your area" }: { children?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:bg-accent"
    >
      <PinIcon />
      {children}
    </button>
  );
}

/** A link that stays in the area being viewed, e.g. Substances goes to /in/portland-or/substances. */
export function ScopedLink({ href, ...props }: Omit<LinkProps, "href"> & { href: string; className?: string; children: ReactNode; "aria-label"?: string }) {
  const { area } = parseScope(usePathname());
  return <Link href={scopedHref(href, area)} {...props} />;
}

export function LocationPicker({ areas }: { areas: Area[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [locate, setLocate] = useState<Locate>({ state: "idle" });
  const current = areas.find((a) => a.slug === parseScope(pathname).area) ?? null;

  // Someone who picked an area before lands on its version of the page, unless they're already
  // looking at a specific area (a shared link, say).
  useEffect(() => {
    const saved = readSaved();
    if (!saved || saved === ALL || parseScope(pathname).area || !isScopable(pathname)) return;
    if (areas.some((a) => a.slug === saved)) router.replace(scopedHref(pathname, saved));
  }, [pathname, areas, router]);

  useEffect(() => {
    const open = () => dialog.current?.showModal();
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = areas.filter((a) => !q || `${a.name} ${a.region}`.toLowerCase().includes(q));
    const byRegion = new Map<string, Area[]>();
    for (const a of matches) byRegion.set(a.region, [...(byRegion.get(a.region) ?? []), a]);
    return byRegion;
  }, [areas, query]);

  function choose(slug: string | null) {
    save(slug ?? ALL);
    dialog.current?.close();
    setLocate({ state: "idle" });
    setQuery("");
    // Pages without an area version (methods, open data) send people to that area's home.
    router.push(isScopable(pathname) ? scopedHref(pathname, slug) : scopedHref("/", slug));
  }

  function locateMe() {
    if (!("geolocation" in navigator)) {
      setLocate({ state: "error", message: "This browser can't share a location. Pick your area from the list instead." });
      return;
    }
    setLocate({ state: "locating" });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const found = nearest(areas, { lat: coords.latitude, lng: coords.longitude });
        if (!found) return setLocate({ state: "idle" });
        if (found.miles <= NEARBY_MILES) return choose(found.area.slug);
        setLocate({ state: "far", area: found.area, miles: Math.round(found.miles) });
      },
      (error) =>
        setLocate({
          state: "error",
          message:
            error.code === error.PERMISSION_DENIED
              ? "Location is turned off for this site. That's fine: pick your area from the list."
              : "We couldn't get your location. Pick your area from the list instead.",
        }),
      // City-level is all we need, so skip GPS and accept a cached fix.
      { enableHighAccuracy: false, maximumAge: 30 * 60 * 1000, timeout: 10_000 },
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="flex w-full items-center gap-2 rounded-full border border-line-strong bg-panel px-3.5 py-1.5 text-sm transition hover:border-ink sm:w-auto"
      >
        <PinIcon />
        <span className="truncate">
          {current ? (
            <>
              <span className="font-medium text-ink">{current.name}</span>
              <span className="text-ink-3">, {current.region}</span>
            </>
          ) : (
            <span className="text-ink-2">All areas</span>
          )}
        </span>
        <span className="ml-auto pl-1 text-xs text-ink-3 sm:ml-0">Change</span>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="area-picker-title"
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="mx-auto mt-[6dvh] max-h-[85dvh] w-[min(30rem,calc(100%-2rem))] overflow-hidden rounded-3xl border border-line-strong bg-panel p-0 text-ink shadow-2xl shadow-black/70 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      >
        <div className="flex max-h-[85dvh] flex-col">
          <div className="border-b border-line p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="area-picker-title" className="font-display text-3xl">
                  Where are you?
                </h2>
                <p className="mt-1 text-sm text-ink-3">See what was tested near you, not hundreds of miles away.</p>
              </div>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                className="-mr-2 -mt-1 rounded-full p-2 text-ink-3 transition hover:bg-white/5 hover:text-ink"
                aria-label="Close"
              >
                <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true">
                  <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={locateMe}
              disabled={locate.state === "locating"}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 font-medium text-page transition hover:bg-accent disabled:opacity-60"
            >
              <LocateIcon />
              {locate.state === "locating" ? "Finding your area…" : "Use my location"}
            </button>
            <p className="mt-2 text-center text-xs text-ink-3">
              Only used on this device to find the nearest area. Never sent to us or stored.
            </p>

            {locate.state === "far" && (
              <div role="status" className="mt-4 rounded-2xl border border-warning/40 bg-warning/[0.07] p-4 text-sm">
                <p className="font-medium text-warning">
                  <span aria-hidden="true">! </span>We don&rsquo;t test near you yet
                </p>
                <p className="mt-1 text-ink-2">
                  The closest area we test is {locate.area.name}, about {locate.miles.toLocaleString("en-US")} miles away.
                  What&rsquo;s going around there may not match what&rsquo;s near you.
                </p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  <button type="button" onClick={() => choose(locate.area.slug)} className="text-ink hover:text-accent">
                    See {locate.area.name} anyway →
                  </button>
                  <button type="button" onClick={() => choose(null)} className="text-ink-2 hover:text-accent">
                    See all areas →
                  </button>
                </div>
              </div>
            )}
            {locate.state === "error" && (
              <p role="status" className="mt-4 rounded-2xl border border-line bg-panel-raised p-4 text-sm text-ink-2">
                {locate.message}
              </p>
            )}

            <label className="mt-5 block">
              <span className="sr-only">Search areas</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a city or state"
                className="w-full rounded-full border border-line-strong bg-page px-4 py-2.5 text-sm placeholder:text-ink-3 focus:border-accent focus:outline-none"
              />
            </label>
          </div>

          <div className="overflow-y-auto p-3 sm:p-4">
            <AreaOption selected={!current} onClick={() => choose(null)} name="All areas" note="Everything we test, combined" />
            {[...groups].map(([region, list]) => (
              <div key={region} className="mt-3">
                <p className="px-3 pb-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ink-3">{region}</p>
                {list.map((a) => (
                  <AreaOption key={a.slug} selected={current?.slug === a.slug} onClick={() => choose(a.slug)} name={a.name} />
                ))}
              </div>
            ))}
            {groups.size === 0 && (
              <p className="px-3 py-6 text-center text-sm text-ink-3">
                We don&rsquo;t test in &ldquo;{query}&rdquo; yet. All areas shows everything we have.
              </p>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}

function AreaOption({ name, note, selected, onClick }: { name: string; note?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/5 ${selected ? "bg-white/5" : ""}`}
    >
      <span>
        <span className="block text-ink">{name}</span>
        {note && <span className="block text-xs text-ink-3">{note}</span>}
      </span>
      {selected && (
        <span className="flex items-center gap-1 text-xs text-accent">
          <span aria-hidden="true">✓</span> Selected
        </span>
      )}
    </button>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" aria-hidden="true">
      <path
        d="M10 18s5.5-5.2 5.5-9.5a5.5 5.5 0 0 0-11 0C4.5 12.8 10 18 10 18Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.5" r="2" fill="currentColor" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4 shrink-0" aria-hidden="true">
      <circle cx="10" cy="10" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1.8" fill="currentColor" />
      <path d="M10 1.5v3M10 15.5v3M1.5 10h3M15.5 10h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
