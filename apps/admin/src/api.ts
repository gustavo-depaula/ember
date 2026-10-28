import type { Resolution } from '@ember/api/src/moderation'
import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import type { Case, Desk, OtherChurch, Progress, Seen } from '../worker/types'

const deskKey = ['desk']

async function call<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(
    `/api${path}`,
    body === undefined
      ? undefined
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
  )
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? response.statusText)
  return data as T
}

export function photoUrl(churchId: string, key: string): string {
  return `/api/photos/${encodeURIComponent(churchId)}/${encodeURIComponent(key)}`
}

// Churches a search turned up, by the case they were found for. The Worker keeps nothing between
// requests, so the page holds them: they stay among the case's other churches until it is reloaded.
type Found = Record<string, OtherChurch[]>
const foundKey = ['found']

function withFound(desk: Desk, found: Found): Desk {
  return {
    ...desk,
    cases: desk.cases.map((item) => {
      const extra = (found[item.churchId] ?? []).filter(
        (match) => !item.others.some((other) => other.church.id === match.church.id),
      )
      return extra.length ? { ...item, others: [...item.others, ...extra] } : item
    }),
  }
}

const working = (desk: Desk | undefined) =>
  desk?.cases.some((item) => item.run && item.run.status !== 'failed') ?? false

// Lay the runs as they now stand over the desk, and fetch the desk again when a draft has landed
// that it doesn't show yet.
function follow(client: QueryClient, progress: Progress) {
  const desk = client.getQueryData<Desk>(deskKey)
  if (!desk) return
  client.setQueryData<Desk>(deskKey, {
    ...desk,
    cases: desk.cases.map((item) => ({ ...item, run: progress.runs[item.churchId] })),
  })
  const landed = desk.cases.some(
    (item) => (progress.reviewedAt[item.churchId] ?? '') !== (item.review?.reviewedAt ?? ''),
  )
  if (landed) void client.invalidateQueries({ queryKey: deskKey })
}

// The desk, and while Claude is reviewing, a poll of how each run is getting on.
export function useDesk() {
  const client = useQueryClient()
  const desk = useQuery({ queryKey: deskKey, queryFn: () => call<Desk>('/desk') })
  const found = useQuery<Found>({
    queryKey: foundKey,
    queryFn: () => ({}),
    initialData: {},
    staleTime: Number.POSITIVE_INFINITY,
  })
  const progress = useQuery({
    queryKey: ['progress'],
    queryFn: () => call<Progress>('/progress'),
    enabled: working(desk.data),
    refetchInterval: 2000,
  })
  useEffect(() => {
    if (progress.data) follow(client, progress.data)
  }, [client, progress.data])
  const data = useMemo(() => desk.data && withFound(desk.data, found.data), [desk.data, found.data])
  return { ...desk, data }
}

// Every write answers with the desk as it now stands.
function useDeskMutation<Input>(request: (input: Input) => Promise<Desk>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (desk) => client.setQueryData(deskKey, desk),
  })
}

// Starting and stopping reviews answer with the runs as they now stand.
function useRunMutation<Input>(request: (input: Input) => Promise<Progress>) {
  const client = useQueryClient()
  return useMutation({ mutationFn: request, onSuccess: (progress) => follow(client, progress) })
}

export function useRefresh() {
  return useDeskMutation<void>(() => call<Desk>('/refresh', {}))
}

// The resolution goes with what this page saw of each church it names, so the Worker can refuse
// one that changed in the meantime.
export function useApply() {
  return useDeskMutation<{ item: Case; resolution: Resolution }>(({ item, resolution }) => {
    const churches = [item.church, ...item.others.map((other) => other.church)]
    const named = [item.churchId, ...(resolution.related ?? []).map((related) => related.churchId)]
    const seen: Seen = Object.fromEntries(
      named.map((id) => [id, churches.find((church) => church?.id === id)?.updatedAt ?? null]),
    )
    return call<Desk>(`/cases/${encodeURIComponent(item.churchId)}/apply`, { resolution, seen })
  })
}

export function useUndo() {
  return useDeskMutation<string>((id) => call<Desk>(`/history/${encodeURIComponent(id)}/undo`, {}))
}

export function useMarkShared() {
  return useDeskMutation<{ ids: string[]; shared: boolean }>(async ({ ids, shared }) => {
    let desk: Desk | undefined
    for (const id of ids) {
      desk = await call<Desk>(`/history/${encodeURIComponent(id)}/shared`, { shared })
    }
    if (!desk) throw new Error('Nothing to mark.')
    return desk
  })
}

export function useReview() {
  return useRunMutation(({ churchId, instruction }: { churchId: string; instruction?: string }) =>
    call<Progress>(`/cases/${encodeURIComponent(churchId)}/review`, { instruction }),
  )
}

export function useSearch() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ churchId, query }: { churchId: string; query: string }) =>
      call<{ matches: OtherChurch[] }>(`/cases/${encodeURIComponent(churchId)}/search`, { query }),
    onSuccess: ({ matches }, { churchId }) =>
      client.setQueryData<Found>(foundKey, (found = {}) => {
        const known = found[churchId] ?? []
        const fresh = matches.filter((m) => !known.some((k) => k.church.id === m.church.id))
        return { ...found, [churchId]: [...known, ...fresh] }
      }),
  })
}

export function useReviewAll() {
  return useRunMutation<void>(() => call<Progress>('/review-all', {}))
}

export function useStop() {
  return useRunMutation((churchId: string) =>
    call<Progress>(`/cases/${encodeURIComponent(churchId)}/stop`, {}),
  )
}
