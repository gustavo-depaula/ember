import type { Transfers } from '@ember/missal'
import { useMemo } from 'react'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { transfersForContentLang } from './loaders'

/** Where the reader's calendar keeps the solemnities that may move to a Sunday. */
export function useOfTransfers(): Transfers {
  const contentLanguage = usePreferencesStore((s) => s.contentLanguage)
  return useMemo(() => transfersForContentLang(contentLanguage), [contentLanguage])
}
