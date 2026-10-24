export function percent(rate: number): string {
  if (rate > 0 && rate < 0.01) return "<1%";
  return `${Math.round(rate * 100)}%`;
}

export function formatWeek(week: string): string {
  return `Week of ${new Date(`${week}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })}`;
}

/** "Oct 19": the Monday of a week, for tight spaces where the label already says "week". */
export function formatWeekShort(week: string): string {
  return new Date(`${week}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export function formatMonth(month: string): string {
  return new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}
