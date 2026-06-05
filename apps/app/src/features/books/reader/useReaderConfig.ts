import { useMemo } from 'react'
import { getCssFontFamily } from '@/config/readingFonts'
import { readingScale } from '@/hooks/useReadingStyle'
import { usePreferencesStore } from '@/stores/preferencesStore'
import type { ReaderConfig } from './protocol'

// Multipliers expressed in font-size units so margins scale with text size
// (preserves a roughly constant letter-count per line across font sizes).
const marginMultiplier = { narrow: 0.8, normal: 1.5, wide: 2.5 } as const

/**
 * Read user reading prefs out of the store and project them into the
 * `ReaderConfig` shape consumed by the DOM surface. Memoised on the primitive
 * preference values so the returned object reference is stable between
 * renders — critical for the DOM bridge, which re-serialises on each change.
 */
export function useReaderConfig(): ReaderConfig {
  const fontFamilyId = usePreferencesStore((s) => s.fontFamily)
  const fontSizeStep = usePreferencesStore((s) => s.fontSizeStep)
  const lineHeightStep = usePreferencesStore((s) => s.lineHeightStep)
  const textAlign = usePreferencesStore((s) => s.textAlign)
  const margin = usePreferencesStore((s) => s.margin)

  return useMemo(() => {
    const fontSizePx = readingScale.fontSize[fontSizeStep - 1]
    const lineHeightPx = Math.round(fontSizePx * readingScale.leadingRatio[lineHeightStep - 1])
    return {
      fontFamily: getCssFontFamily(fontFamilyId),
      fontSizePx,
      lineHeightPx,
      textAlign,
      marginPx: Math.round(fontSizePx * marginMultiplier[margin]),
    }
  }, [fontFamilyId, fontSizeStep, lineHeightStep, textAlign, margin])
}
