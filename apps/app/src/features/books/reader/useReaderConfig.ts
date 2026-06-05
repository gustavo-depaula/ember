import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { getCssFontFamily } from '@/config/readingFonts'
import { readingScale } from '@/hooks/useReadingStyle'
import { usePreferencesStore } from '@/stores/preferencesStore'

const marginToPx = { narrow: 16, normal: 28, wide: 48 } as const

const themeColors = {
  light: { background: '#FAF6F0', color: '#1a1815' },
  dark: { background: '#0E0D0C', color: '#EDE4D8' },
} as const

export type ReaderConfig = {
  fontFamily: string
  fontSizePx: number
  lineHeightPx: number
  marginPx: number
  textAlign: 'justify' | 'left'
  background: string
  color: string
  isDark: boolean
}

export function useReaderConfig(): ReaderConfig {
  const systemScheme = useColorScheme()
  const themePreference = usePreferencesStore((s) => s.theme)
  const fontFamilyId = usePreferencesStore((s) => s.fontFamily)
  const fontSizeStep = usePreferencesStore((s) => s.fontSizeStep)
  const lineHeightStep = usePreferencesStore((s) => s.lineHeightStep)
  const textAlign = usePreferencesStore((s) => s.textAlign)
  const margin = usePreferencesStore((s) => s.margin)

  return useMemo(() => {
    const resolvedTheme = themePreference === 'system' ? (systemScheme ?? 'light') : themePreference
    const isDark = resolvedTheme === 'dark'
    const fontSizePx = readingScale.fontSize[fontSizeStep - 1]
    const ratio = readingScale.leadingRatio[lineHeightStep - 1]
    return {
      fontFamily: getCssFontFamily(fontFamilyId),
      fontSizePx,
      lineHeightPx: Math.round(fontSizePx * ratio),
      marginPx: marginToPx[margin],
      textAlign,
      background: themeColors[isDark ? 'dark' : 'light'].background,
      color: themeColors[isDark ? 'dark' : 'light'].color,
      isDark,
    }
  }, [themePreference, systemScheme, fontFamilyId, fontSizeStep, lineHeightStep, textAlign, margin])
}
