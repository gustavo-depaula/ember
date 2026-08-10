import { Platform } from 'react-native'

import { getFontFamily } from '@/config/readingFonts'
import { usePreferencesStore } from '@/stores/preferencesStore'

// Reading-specific scale — larger than body font tokens for comfortable extended reading
export const readingScale = {
  fontSize: [16, 19, 22, 26, 32] as const,
  // lineHeightStep selects a leading RATIO (not absolute px) so leading scales
  // with the chosen font size — fixes cramped leading at large sizes. Default
  // step 5 ≈ 1.5.
  leadingRatio: [1.25, 1.32, 1.4, 1.45, 1.5, 1.6, 1.7] as const,
}

// Comfortable measure for long-form reading (~66 chars). Consumed by reading
// COLUMN containers on wide screens via useReadingMaxWidth — never applied per
// line (a per-Text maxWidth fights flex and breaks bilingual side-by-side).
const maxMeasureEm = 34

const marginMap = { narrow: '$sm', normal: '$md', wide: '$lg' } as const

// Prevents justify from stretching letters — only word spacing
const webJustifyStyle = { textJustify: 'inter-word' } as Record<string, string>

export function useReadingStyle() {
  const fontFamilyId = usePreferencesStore((s) => s.fontFamily)
  const fontSizeStep = usePreferencesStore((s) => s.fontSizeStep)
  const lineHeightStep = usePreferencesStore((s) => s.lineHeightStep)
  const textAlign = usePreferencesStore((s) => s.textAlign)

  const fontSize = readingScale.fontSize[fontSizeStep - 1]
  const ratio = readingScale.leadingRatio[lineHeightStep - 1]

  return {
    // Raw font family name — valid at runtime but not a Tamagui token
    fontFamily: getFontFamily(fontFamilyId) as '$body',
    fontSize,
    lineHeight: Math.round(fontSize * ratio),
    textAlign,
    // Android's own hyphenator, for text that never reaches the Knuth–Plass
    // pass — a line the justifier declined, or one the platform is breaking
    // because the reader asked for ragged. It defaults to `'none'`, which
    // leaves justified text unhyphenated: the worst of both. iOS exposes no
    // equivalent, which is exactly why so much of the app now breaks its own
    // lines. See `docs/design/typography-justification.md`.
    android_hyphenationFrequency: 'full' as const,
    ...(textAlign === 'justify' && Platform.OS === 'web' ? { style: webJustifyStyle } : {}),
  }
}

export function useReadingFontSizePx() {
  const step = usePreferencesStore((s) => s.fontSizeStep)
  return readingScale.fontSize[step - 1]
}

// Max line length for the reading column on wide screens (tablet/web). Apply
// to the content container's maxWidth, centered — keeps long-form measure
// comfortable instead of running the full viewport width.
export function useReadingMaxWidth() {
  const step = usePreferencesStore((s) => s.fontSizeStep)
  return readingScale.fontSize[step - 1] * maxMeasureEm
}

export function useReadingMargin() {
  const margin = usePreferencesStore((s) => s.margin)
  return marginMap[margin]
}
