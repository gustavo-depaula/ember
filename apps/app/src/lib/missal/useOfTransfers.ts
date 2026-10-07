import type { Transfers } from '@ember/missal'
import { useMemo } from 'react'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { transfersForJurisdiction } from './loaders'

/** Where the reader's calendar keeps the solemnities that may move to a Sunday. */
export function useOfTransfers(): Transfers {
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  return useMemo(() => transfersForJurisdiction(jurisdiction), [jurisdiction])
}
