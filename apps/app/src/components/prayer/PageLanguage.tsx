import type { ContentLanguage } from '@ember/content-engine'
import { createContext, type ReactNode, useContext } from 'react'

import type { pageLayout } from '@/lib/practiceLanguages'
import { usePreferencesStore } from '@/stores/preferencesStore'

/**
 * The languages of the page being read. `primary`/`secondary` are the
 * languages the text was fetched in (a BilingualText's two sides); `swapped`
 * shows the secondary first, for a prayer in Latin fetched vernacular-first.
 */
export type PageLanguage = {
  pray: ContentLanguage
  follow: ContentLanguage | undefined
  primary: ContentLanguage
  secondary: ContentLanguage | undefined
  swapped: boolean
  layout: ReturnType<typeof pageLayout>
}

const Context = createContext<PageLanguage | undefined>(undefined)

export function PageLanguageProvider({
  value,
  children,
}: {
  value: PageLanguage
  children: ReactNode
}) {
  return <Context.Provider value={value}>{children}</Context.Provider>
}

/** The page's languages; outside a prayer, the reader's own language alone. */
export function usePageLanguage(): PageLanguage {
  const scoped = useContext(Context)
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  return (
    scoped ?? {
      pray: contentLanguage,
      follow: undefined,
      primary: contentLanguage,
      secondary: undefined,
      swapped: false,
      layout: 'single',
    }
  )
}
