import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import type { ReaderFlowMode } from '@/config/readerFlow'
import { resolvePalette } from '@/config/readerPalettes'
import { getCssFontFamily } from '@/config/readingFonts'
import { readingScale } from '@/hooks/useReadingStyle'
import { usePreferencesStore } from '@/stores/preferencesStore'

const marginToPx = { narrow: 16, normal: 28, wide: 48 } as const

export type ReaderConfig = {
  fontFamily: string
  fontSizePx: number
  lineHeightPx: number
  marginPx: number
  textAlign: 'justify' | 'left'
  background: string
  color: string
  isDark: boolean
  flow: ReaderFlowMode
}

export function useReaderConfig(): ReaderConfig {
  const systemScheme = useColorScheme()
  const themePreference = usePreferencesStore((s) => s.theme)
  const readerPalette = usePreferencesStore((s) => s.readerPalette)
  const fontFamilyId = usePreferencesStore((s) => s.fontFamily)
  const fontSizeStep = usePreferencesStore((s) => s.fontSizeStep)
  const lineHeightStep = usePreferencesStore((s) => s.lineHeightStep)
  const textAlign = usePreferencesStore((s) => s.textAlign)
  const margin = usePreferencesStore((s) => s.margin)
  const readerFlow = usePreferencesStore((s) => s.readerFlow)

  return useMemo(() => {
    const resolvedTheme = themePreference === 'system' ? (systemScheme ?? 'light') : themePreference
    const systemIsDark = resolvedTheme === 'dark'
    const palette = resolvePalette(readerPalette, systemIsDark)
    const fontSizePx = readingScale.fontSize[fontSizeStep - 1]
    const ratio = readingScale.leadingRatio[lineHeightStep - 1]
    return {
      fontFamily: getCssFontFamily(fontFamilyId),
      fontSizePx,
      lineHeightPx: Math.round(fontSizePx * ratio),
      marginPx: marginToPx[margin],
      textAlign,
      background: palette.background,
      color: palette.color,
      isDark: palette.isDark,
      flow: readerFlow,
    }
  }, [
    themePreference,
    systemScheme,
    readerPalette,
    fontFamilyId,
    fontSizeStep,
    lineHeightStep,
    textAlign,
    margin,
    readerFlow,
  ])
}
