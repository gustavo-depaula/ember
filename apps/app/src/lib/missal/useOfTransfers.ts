import type { Transfers } from '@ember/missal'
import { useMemo } from 'react'
import { usePreferencesStore } from '@/stores/preferencesStore'
import { regionsForJurisdiction, transfersForJurisdiction } from './loaders'

/** Where the reader's calendar keeps the solemnities that may move to a Sunday. */
export function useOfTransfers(): Transfers {
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  return useMemo(() => transfersForJurisdiction(jurisdiction), [jurisdiction])
}

/** The national calendar the reader follows. */
export function useOfRegions(): string[] {
  const jurisdiction = usePreferencesStore((s) => s.jurisdiction)
  return useMemo(() => regionsForJurisdiction(jurisdiction), [jurisdiction])
}
