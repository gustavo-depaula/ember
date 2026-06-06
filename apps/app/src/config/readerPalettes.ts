export type ReaderPaletteId = 'auto' | 'light' | 'sepia' | 'paper' | 'night' | 'midnight'

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

export const READER_PALETTE_IDS: ReaderPaletteId[] = [
  'auto',
  'light',
  'sepia',
  'paper',
  'night',
  'midnight',
]

export function resolvePalette(id: ReaderPaletteId, systemIsDark: boolean): ReaderPalette {
  if (id === 'auto') return systemIsDark ? palettes.night : palettes.light
  return palettes[id]
}
