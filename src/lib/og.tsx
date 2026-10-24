// Shared pieces for the images Next renders with next/og (the social share image and the alert
// story cards). Satori needs real font files, so the OFL fonts live in src/assets/fonts.
// Files are read synchronously on purpose: with Cache Components, an async file read stops a
// route from being prerendered, and these images should be built once, not on every request.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { BRAND, MARK } from "./brand";

const ASSETS = join(process.cwd(), "src", "assets");

export function ogFonts() {
  const font = (file: string) => readFileSync(join(ASSETS, "fonts", file));
  return [
    { name: "Instrument Serif", data: font("InstrumentSerif-Regular.ttf"), weight: 400 as const, style: "normal" as const },
    { name: "Instrument Serif", data: font("InstrumentSerif-Italic.ttf"), weight: 400 as const, style: "italic" as const },
    { name: "Geist", data: font("Geist-Regular.ttf"), weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: font("Geist-Medium.ttf"), weight: 500 as const, style: "normal" as const },
  ];
}

/** An image from src/assets/images as a data URL, so the renderer never makes a network request. */
export function assetImage(file: string): string {
  return `data:image/jpeg;base64,${readFileSync(join(ASSETS, "images", file)).toString("base64")}`;
}

export function OgMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox={MARK.viewBox}>
      <path d={MARK.liquid} fill={BRAND.accent} />
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

/** Mark plus wordmark, the same lockup as the site header. */
export function OgLockup({ size }: { size: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35 }}>
      <OgMark size={size} />
      <span style={{ fontFamily: "Geist", fontWeight: 500, fontSize: size * 0.82, color: BRAND.ink, letterSpacing: -0.5 }}>
        Clearline
      </span>
    </div>
  );
}
