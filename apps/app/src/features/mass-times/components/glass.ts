import { useThemeName } from 'tamagui'

// Subtle translucent fill for tiles/rows resting on the sheet's glass — faint elevations rather than
// opaque blocks, so the material shows through and they blend (the Apple Maps in-sheet look).
export function useGlassTile(strong = false): string {
  const dark = useThemeName().startsWith('dark')
  if (dark) return strong ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.07)'
  return strong ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.045)'
}
