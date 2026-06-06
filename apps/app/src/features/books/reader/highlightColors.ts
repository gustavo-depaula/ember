import type { HighlightColor } from './highlights'

export const HIGHLIGHT_COLOR_IDS: HighlightColor[] = ['yellow', 'green', 'blue', 'pink', 'purple']

type PaintColor = {
  /** Solid swatch color shown in the toolbar / scrubber dots. */
  swatch: string
  /** Paint fill for the highlight overlay; tuned for ~35% alpha on light bg. */
  paintLight: string
  /** Paint fill on dark reader palettes (night/midnight). Higher alpha so the
   *  color remains legible against the dark page. */
  paintDark: string
}

export const HIGHLIGHT_COLORS: Record<HighlightColor, PaintColor> = {
  yellow: {
    swatch: '#FCE38A',
    paintLight: 'rgba(252,227,138,0.55)',
    paintDark: 'rgba(252,227,138,0.45)',
  },
  green: {
    swatch: '#A8D8B9',
    paintLight: 'rgba(168,216,185,0.55)',
    paintDark: 'rgba(168,216,185,0.45)',
  },
  blue: {
    swatch: '#A0C4FF',
    paintLight: 'rgba(160,196,255,0.55)',
    paintDark: 'rgba(160,196,255,0.45)',
  },
  pink: {
    swatch: '#FFB5C2',
    paintLight: 'rgba(255,181,194,0.55)',
    paintDark: 'rgba(255,181,194,0.45)',
  },
  purple: {
    swatch: '#C9A8E9',
    paintLight: 'rgba(201,168,233,0.55)',
    paintDark: 'rgba(201,168,233,0.45)',
  },
}

export function paintColorFor(color: HighlightColor, isDark: boolean): string {
  const c = HIGHLIGHT_COLORS[color]
  return isDark ? c.paintDark : c.paintLight
}
