// The page's measures, shared with the website (`apps/site/src/styles/global.css`):
// reading stays in the column on every screen; hubs, shelves and split pages
// open up to the wide measure.
export const columnWidth = 640
export const wideWidth = 1240
export const pageGutter = 24

// Window widths, not devices: an iPad in Split View is a phone, and a phone
// never reaches the first of these.
export const breakpoints = {
  /** Shelves stand as grids and the page leaves the column. An iPad mini upright. */
  medium: 700,
  /** Room for a second column: a hub's index, a detail page's aside. */
  expanded: 1000,
  /** Room for a rail either side of the reading column. */
  rails: 1100,
} as const

export type PageMeasure = 'column' | 'wide'

/** The outer width of a page of this measure in a window, gutters included. */
export function pageOuterWidth(windowWidth: number, measure: PageMeasure): number {
  if (measure === 'column' || windowWidth < breakpoints.medium)
    return Math.min(windowWidth, columnWidth)
  return Math.min(windowWidth, wideWidth + pageGutter * 2)
}

/** How many cells at least `minCell` wide fit a row, and the width each then takes. */
export function gridCells(
  available: number,
  minCell: number,
  gap: number,
  minColumns = 1,
): { columns: number; cell: number } {
  const columns = Math.max(minColumns, Math.floor((available + gap) / (minCell + gap)))
  return { columns, cell: Math.floor((available - gap * (columns - 1)) / columns) }
}
