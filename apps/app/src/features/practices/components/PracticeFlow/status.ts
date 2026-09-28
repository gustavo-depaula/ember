import type { UseQueryResult } from '@tanstack/react-query'
import type { PracticeManifest } from '@/content/manifestTypes'
import type { FlowDefinition } from '@/content/types'
import type { PracticeContent } from './hooks/usePracticeContent'

export type PracticeFlowStatus =
  | { kind: 'loading' }
  | { kind: 'missing' }
  | { kind: 'content-error' }
  | { kind: 'ready' }

export type DerivePracticeFlowStatusArgs = {
  manifest: PracticeManifest | undefined
  flow: FlowDefinition | undefined
  flowQuery: UseQueryResult<FlowDefinition | null>
  contentQuery: UseQueryResult<PracticeContent>
}

// Decide which render branch to show. Precedence:
//   loading:       have a manifest but the flow blob is still on the wire
//   missing:       no manifest or no flow → screen needs the "no content" leaf
//   content-error: flow loaded but resolve/preprocess threw
//   loading:       still resolving/preprocessing
//   ready:         sections are in hand
export function derivePracticeFlowStatus({
  manifest,
  flow,
  flowQuery,
  contentQuery,
}: DerivePracticeFlowStatusArgs): PracticeFlowStatus {
  if (manifest && flowQuery.isLoading) return { kind: 'loading' }
  if (!manifest || !flow) return { kind: 'missing' }
  if (contentQuery.isError) return { kind: 'content-error' }
  if (contentQuery.isLoading) return { kind: 'loading' }
  return { kind: 'ready' }
}
