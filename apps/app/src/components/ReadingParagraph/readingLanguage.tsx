import { createContext, type ReactNode, useContext } from 'react'

import { usePreferencesStore } from '@/stores/preferencesStore'

const Context = createContext<string | undefined>(undefined)

/**
 * The language the text inside is written in, for everything below that
 * hyphenates or breaks lines by language.
 *
 * Set by whoever knows it — `BilingualBlock` knows which column is the
 * secondary language — so a reading surface several components down doesn't
 * have to be handed it. Without it, a Latin secondary column is hyphenated
 * with the primary language's patterns.
 */
export function ReadingLanguage({
  language,
  children,
}: {
  language: string | undefined
  children: ReactNode
}) {
  return <Context.Provider value={language}>{children}</Context.Provider>
}

/** `override`, else the nearest `ReadingLanguage`, else the content language. */
export function useReadingLanguage(override?: string): string {
  const scoped = useContext(Context)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  return override ?? scoped ?? contentLanguage
}
