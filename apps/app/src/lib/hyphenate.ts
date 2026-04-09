// eslint-disable-next-line @typescript-eslint/no-var-requires
const createHyphenator = require('hyphen') as (
  patterns: unknown,
  options?: { async?: boolean },
) => (text: string) => string
const enUsPatterns = require('hyphen/patterns/en-us')
const ptPatterns = require('hyphen/patterns/pt')
const laPatterns = require('hyphen/patterns/la')

import { usePreferencesStore } from '@/stores/preferencesStore'

const hyphenators = {
  'en-US': createHyphenator(enUsPatterns, { async: false }),
  'pt-BR': createHyphenator(ptPatterns, { async: false }),
  la: createHyphenator(laPatterns, { async: false }),
} as Record<string, (text: string) => string>

export function hyphenate(text: string, language?: string): string {
  const lang = language ?? usePreferencesStore.getState().contentLanguage
  const fn = hyphenators[lang] ?? hyphenators['en-US']
  return fn(text)
}
