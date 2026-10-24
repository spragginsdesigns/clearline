import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";
import { isDemo, samples } from "@/lib/data";
import { assetImage, OgLockup, ogFonts } from "@/lib/og";

export const alt = "Clearline: know what's really in it. Independent drug checking results.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fonts = ogFonts();
  const background = assetImage("og-spectrum.jpg");
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: BRAND.page, position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img */}
        <img src={background} alt="" width={1200} height={800} style={{ position: "absolute", top: -40, left: 160, opacity: 0.9 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            width: "100%",
            height: "100%",
            backgroundImage: `linear-gradient(90deg, ${BRAND.page} 30%, rgba(10,12,17,0.2) 100%)`,
          }}
        >
          <OgLockup size={52} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Instrument Serif", fontSize: 108, lineHeight: 1, color: BRAND.ink }}>
              Know what&rsquo;s&nbsp;<span style={{ fontStyle: "italic", color: BRAND.accent }}>really</span>&nbsp;in it.
            </div>
            <div style={{ display: "flex", marginTop: 28, fontFamily: "Geist", fontSize: 30, color: BRAND.ink2, maxWidth: 820 }}>
              Independent drug checking: purity, cuts and alerts from {samples.length.toLocaleString("en-US")} tested
              samples.
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, fontFamily: "Geist", fontSize: 22, color: BRAND.ink3 }}>
            <span>Reagent tests</span>
            <span>·</span>
            <span>FTIR spectroscopy</span>
            <span>·</span>
            <span>Fentanyl strips</span>
            {isDemo && <span style={{ marginLeft: "auto", color: "#fab219" }}>Demo data</span>}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
