// Writes the favicon set from the one mark geometry in src/lib/brand.ts:
//
//   src/app/icon.svg        the mark on a dark tile, for modern browsers
//   src/app/favicon.ico     16, 32 and 48 px, for everything else
//   src/app/apple-icon.png  180 px, full-bleed (iOS rounds the corners itself)
//   public/brand/mark.svg   the bare mark for anyone who needs the logo
//
// Needs ImageMagick 7 (`magick`) on PATH for the raster files.
//
//   bun scripts/build-icons.ts

import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BRAND, MARK } from "../src/lib/brand";

const ROOT = process.cwd();

function mark(stroke: number): string {
  return (
    `<path d="${MARK.liquid}" fill="${BRAND.accent}"/>` +
    `<path d="${MARK.vessel}" fill="none" stroke="${BRAND.ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>`
  );
}

/** The mark scaled into a dark tile. Small sizes get a heavier stroke so the outline survives 16 px. */
function tile({ radius, scale, stroke }: { radius: number; scale: number; stroke: number }): string {
  const offset = Math.round(((32 - 32 * scale) / 2) * 100) / 100;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
    `<rect width="32" height="32" rx="${radius}" fill="${BRAND.panel}"/>` +
    `<g transform="translate(${offset} ${Math.round((offset + 0.4) * 100) / 100}) scale(${scale})">${mark(stroke)}</g>` +
    `</svg>\n`
  );
}

const bare = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.viewBox}">${mark(MARK.stroke)}</svg>\n`;
const favicon = tile({ radius: 7, scale: 0.8, stroke: 3 });
const apple = tile({ radius: 0, scale: 0.62, stroke: MARK.stroke });

mkdirSync(join(ROOT, "public", "brand"), { recursive: true });
writeFileSync(join(ROOT, "public", "brand", "mark.svg"), bare);
writeFileSync(join(ROOT, "src", "app", "icon.svg"), favicon);

const tmp = mkdtempSync(join(tmpdir(), "clearline-icons-"));
try {
  const render = (svg: string, size: number, name: string) => {
    const src = join(tmp, `${name}.svg`);
    writeFileSync(src, svg);
    const out = join(tmp, `${name}.png`);
    execFileSync("magick", ["-background", "none", "-density", String(size * 9), src, "-resize", `${size}x${size}`, out]);
    return out;
  };
  const sizes = [16, 32, 48].map((s) => render(favicon, s, `fav-${s}`));
  execFileSync("magick", [...sizes, join(ROOT, "src", "app", "favicon.ico")]);
  const applePng = render(apple, 180, "apple");
  execFileSync("magick", [applePng, "-strip", "-depth", "8",join(ROOT, "src", "app", "apple-icon.png")]);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log("Wrote src/app/icon.svg, favicon.ico, apple-icon.png and public/brand/mark.svg");
