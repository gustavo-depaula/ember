import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { getCssFontFamily } from '@/config/readingFonts'
import { readingScale } from '@/hooks/useReadingStyle'
import { type ReaderPaletteId, usePreferencesStore } from '@/stores/preferencesStore'

const marginToPx = { narrow: 16, normal: 28, wide: 48 } as const

export type ReaderPalette = {
  id: ReaderPaletteId
  background: string
  color: string
  isDark: boolean
}

const palettes: Record<Exclude<ReaderPaletteId, 'auto'>, ReaderPalette> = {
  light: { id: 'light', background: '#FAF6F0', color: '#1a1815', isDark: false },
  sepia: { id: 'sepia', background: '#F4E8D0', color: '#4A3A2A', isDark: false },
  paper: { id: 'paper', background: '#FFFFFF', color: '#0A0A0A', isDark: false },
  night: { id: 'night', background: '#0E0D0C', color: '#EDE4D8', isDark: true },
  midnight: { id: 'midnight', background: '#000000', color: '#C5BDB1', isDark: true },
}

export function resolvePalette(id: ReaderPaletteId, systemIsDark: boolean): ReaderPalette {
  if (id === 'auto') return systemIsDark ? palettes.night : palettes.light
  return palettes[id]
}

export const READER_PALETTE_IDS: ReaderPaletteId[] = [
  'auto',
  'light',
  'sepia',
  'paper',
  'night',
  'midnight',
]

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
  const readerPalette = usePreferencesStore((s) => s.readerPalette)
  const fontFamilyId = usePreferencesStore((s) => s.fontFamily)
  const fontSizeStep = usePreferencesStore((s) => s.fontSizeStep)
  const lineHeightStep = usePreferencesStore((s) => s.lineHeightStep)
  const textAlign = usePreferencesStore((s) => s.textAlign)
  const margin = usePreferencesStore((s) => s.margin)

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
  ])
}
