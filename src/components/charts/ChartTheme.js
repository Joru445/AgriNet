const LIGHT_PALETTE = [
  "#2D6A4F",
  "#52B788",
  "#74C69D",
  "#95D5B2",
  "#D8F3DC",
  "#2B6CB0",
  "#ED8A19",
  "#6B46C1",
  "#E53E3E",
  "#718096",
];

const DARK_PALETTE = [
  "#52B788",
  "#74C69D",
  "#95D5B2",
  "#B7E4C7",
  "#D8F3DC",
  "#63B3ED",
  "#F6AD55",
  "#9F7AEA",
  "#FC8181",
  "#A0AEC0",
];

/**
 * Return a palette appropriate for the current resolved theme.
 */
export function getChartPalette(resolvedTheme) {
  return resolvedTheme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
}

export function colorAt(resolvedTheme, index) {
  const palette = getChartPalette(resolvedTheme);
  return palette[index % palette.length];
}

export const GRID_COLOR = "rgba(140, 160, 145, 0.15)";
