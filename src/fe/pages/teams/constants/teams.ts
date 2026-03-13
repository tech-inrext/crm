// ─── Search ───────────────────────────────────────────────────────────────────
export const SEARCH_DEBOUNCE_DELAY = 300;

// ─── Permissions ──────────────────────────────────────────────────────────────
export const TEAMS_PERMISSION_MODULE = "team";

// ─── Colours used for hierarchy depth levels ─────────────────────────────────
export const HIERARCHY_COLORS = [
  "#3f51b5",
  "#00bcd4",
  "#4caf50",
  "#ff9800",
  "#e91e63",
] as const;

export const getNodeColor = (depth: number, colors: readonly string[]): string => {
  return colors[depth % colors.length];
};
