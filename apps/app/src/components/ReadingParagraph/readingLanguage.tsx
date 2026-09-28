import { createContext, type ReactNode, useContext } from 'react'

import { usePreferencesStore } from '@/stores/preferencesStore'

const Context = createContext<string | undefined>(undefined)

/**
 * The language of the text inside, for everything below that hyphenates by
 * language. Without it, a Latin secondary column in `BilingualBlock` is
 * hyphenated with the primary language's patterns.
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
