import { createContext, type ReactNode, useContext } from 'react'

import { usePageLanguage } from '../prayer/PageLanguage'

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

/** `override`, else the nearest `ReadingLanguage`, else the page's first language. */
export function useReadingLanguage(override?: string): string {
  const scoped = useContext(Context)
  const page = usePageLanguage()
  return override ?? scoped ?? page.primary
}
