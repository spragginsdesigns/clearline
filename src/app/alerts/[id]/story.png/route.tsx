import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { alerts, area, isDemo } from "@/lib/data";
import { formatWeek } from "@/lib/format";
import { assetImage, OgLockup, ogFonts } from "@/lib/og";
import { SITE_URL } from "@/lib/site";

// A 9:16 story card per alert, sized for Instagram and TikTok stories (1080x1920), prerendered at
// build time. Like the site, it shows the week and the alert's broad area, never anything finer.

const WIDTH = 1080;
const HEIGHT = 1920;
const WARNING = "#fab219";
const CRITICAL = "#e66767";

export function generateStaticParams() {
  return alerts.map((a) => ({ id: a.id }));
}

export async function GET(_request: Request, ctx: RouteContext<"/alerts/[id]/story.png">) {
  const { id } = await ctx.params;
  const alert = alerts.find((a) => a.id === id);
  if (!alert) return new Response("Not found", { status: 404 });

  const critical = alert.severity === "critical";
  const tone = critical ? CRITICAL : WARNING;
  const fonts = ogFonts();
  const horizon = assetImage("story-horizon.jpg");

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: WIDTH, height: HEIGHT, background: BRAND.page, position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
        <img src={horizon} alt="" width={WIDTH} height={HEIGHT} style={{ position: "absolute", top: 0, left: 0 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: "150px 84px 96px",
            fontFamily: "Geist",
            color: BRAND.ink,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <OgLockup size={64} />
            {isDemo && (
              <span style={{ fontSize: 28, color: WARNING, border: `2px solid ${WARNING}`, borderRadius: 999, padding: "6px 20px" }}>
                Demo data
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 120, fontSize: 32, fontWeight: 500, color: tone, letterSpacing: 4 }}>
            <Triangle color={tone} />
            {[critical ? "Alert" : "Heads up", alert.area ? area(alert.area).name : null, formatWeek(alert.week)]
              .filter(Boolean)
              .join(" · ")
              .toUpperCase()}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontFamily: "Instrument Serif", fontSize: 112, lineHeight: 1.02 }}>
            {alert.title}
          </div>
          <div style={{ display: "flex", marginTop: 40, fontSize: 40, lineHeight: 1.4, color: BRAND.ink2 }}>{alert.body}</div>

          <div style={{ display: "flex", gap: 20, marginTop: 72 }}>
            <Tip icon={<CheckIcon />} label="Test every time" />
            <Tip icon={<PeopleIcon />} label="Don't use alone" />
            <Tip icon={<HeartIcon />} label="Carry naloxone" />
          </div>

          {/* Kept above the bottom ~250px that Instagram and TikTok cover with their own controls. */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 64, fontSize: 34 }}>
            <span style={{ color: BRAND.ink }}>Results and alerts at {SITE_URL.host}</span>
            <span style={{ fontSize: 26, color: BRAND.ink3, letterSpacing: 3 }}>ANONYMOUS · NO JUDGMENT</span>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
      headers: { "Content-Disposition": `inline; filename="clearline-alert-${alert.id}.png"` },
    },
  );
}

function Tip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
        flex: 1,
        padding: "36px 12px",
        borderRadius: 28,
        background: "rgba(24,29,41,0.85)",
        border: "2px solid rgba(255,255,255,0.08)",
        fontSize: 32,
        textAlign: "center",
      }}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
}

const ICON = { width: 72, height: 72, viewBox: "0 0 24 24", fill: "none", stroke: BRAND.accent, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function CheckIcon() {
  return (
    <svg {...ICON}>
      <path d="M12 3l7 3v6c0 4.2-3 7.4-7 9-4-1.6-7-4.8-7-9V6l7-3z" />
      <path d="M8.5 12.2l2.3 2.3 4.7-4.8" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg {...ICON}>
      <circle cx="9" cy="8" r="3.2" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M3 20c0-3.4 2.7-6 6-6s6 2.6 6 6" />
      <path d="M15.5 14.3c.5-.2 1-.3 1.5-.3 2.5 0 4 1.9 4 4.6" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg {...ICON}>
      <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />
    </svg>
  );
}

function Triangle({ color }: { color: string }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24">
      <path d="M12 3L22 20H2L12 3z" fill={color} />
    </svg>
  );
}
