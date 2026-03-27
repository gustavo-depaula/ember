import { Platform } from 'react-native'

import { getFontFamily } from '@/config/readingFonts'
import { useReadingConfigStore } from '@/stores/readingConfigStore'

// Reading-specific scale — larger than body font tokens for comfortable extended reading
export const readingScale = {
  fontSize: [16, 19, 22, 26, 32] as const,
  lineHeight: [24, 28, 34, 40, 48] as const,
}

const marginMap = { narrow: '$sm', normal: '$md', wide: '$lg' } as const

// Prevents justify from stretching letters — only word spacing
const webJustifyStyle = { textJustify: 'inter-word' } as Record<string, string>

export function useReadingStyle() {
  const fontFamilyId = useReadingConfigStore((s) => s.fontFamily)
  const fontSizeStep = useReadingConfigStore((s) => s.fontSizeStep)
  const lineHeightStep = useReadingConfigStore((s) => s.lineHeightStep)
  const textAlign = useReadingConfigStore((s) => s.textAlign)

  return {
    // Raw font family name — valid at runtime but not a Tamagui token
    fontFamily: getFontFamily(fontFamilyId) as '$body',
    fontSize: readingScale.fontSize[fontSizeStep - 1],
    lineHeight: readingScale.lineHeight[lineHeightStep - 1],
    textAlign,
    ...(textAlign === 'justify' && Platform.OS === 'web' ? { style: webJustifyStyle } : {}),
  }
}

export function useReadingFontSizePx() {
  const step = useReadingConfigStore((s) => s.fontSizeStep)
  return readingScale.fontSize[step - 1]
}

export function useReadingMargin() {
  const margin = useReadingConfigStore((s) => s.margin)
  return marginMap[margin]
}
