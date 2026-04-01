import enPatterns from 'hyphenation.en-us'
import ptPatterns from 'hyphenation.pt'
import Hypher from 'hypher'
import { useMemo } from 'react'
import { Platform } from 'react-native'

import { usePreferencesStore } from '@/stores/preferencesStore'

const isIos = Platform.OS === 'ios'

const hyphers: Record<string, Hypher> = {
  en: new Hypher(enPatterns),
  pt: new Hypher(ptPatterns),
}

// Insert soft hyphens (\u00AD) at syllable boundaries so iOS justify
// distributes space between words instead of stretching characters apart.
// No-op on non-iOS platforms where justify already works correctly.
export function hyphenate(text: string, language = 'en'): string {
  if (!isIos) return text
  const h = hyphers[language] ?? hyphers.en
  return h.hyphenateText(text)
}

export function useHyphenate(text: string): string {
  const language = usePreferencesStore((s) => s.language)
  return useMemo(() => hyphenate(text, language), [text, language])
}
