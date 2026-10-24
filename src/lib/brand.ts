// The Clearline mark: a lab vessel with one level line across it, "a level, honest reading".
// One geometry, drawn on a 32-unit grid, feeds the header logo, the favicons (scripts/build-icons.ts),
// the Open Graph image and the alert story cards, so they can never drift apart.
// Chosen from the Sunburst explorations in docs/brand/ (direction "meniscus").

export const BRAND = {
  page: "#0a0c11",
  panel: "#121620",
  ink: "#f0efec",
  ink2: "#c3c2b7",
  ink3: "#8f8e88",
  accent: "#a99dff",
} as const;

export const MARK = {
  viewBox: "0 0 32 32",
  /** The liquid: a level top edge, filled down into the round bottom. Sits under the outline. */
  liquid: "M5.5 16.5H26.5V17.5A10.5 10.5 0 0 1 5.5 17.5Z",
  /** The vessel outline, open at the top. */
  vessel: "M5.5 4.5V17.5A10.5 10.5 0 0 0 26.5 17.5V4.5",
  stroke: 2.5,
} as const;
