import type { Resolution } from '@ember/api/src/moderation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { Desk, DeskEvent } from '../server/types'

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

// The desk, kept current by the server's event stream: a whole new desk when the queue changes, a
// single run when Claude makes progress on one church.
export function useDesk() {
  const client = useQueryClient()
  useEffect(() => {
    const events = new EventSource('/api/events')
    events.onmessage = (message) => {
      const event = JSON.parse(message.data) as DeskEvent
      if (event.type === 'desk') return client.setQueryData(deskKey, event.desk)
      client.setQueryData<Desk>(
        deskKey,
        (desk) =>
          desk && {
            ...desk,
            cases: desk.cases.map((item) =>
              item.churchId === event.churchId ? { ...item, run: event.run } : item,
            ),
          },
      )
    }
    return () => events.close()
  }, [client])
  return useQuery({ queryKey: deskKey, queryFn: () => call<Desk>('/desk') })
}

// Every write answers with the desk as it now stands.
function useDeskMutation<Input>(request: (input: Input) => Promise<Desk>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (desk) => client.setQueryData(deskKey, desk),
  })
}

export function useRefresh() {
  return useDeskMutation<void>(() => call<Desk>('/refresh', {}))
}

export function useApply() {
  return useDeskMutation<{ churchId: string; resolution: Resolution }>(({ churchId, resolution }) =>
    call<Desk>(`/cases/${encodeURIComponent(churchId)}/apply`, resolution),
  )
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
  return useMutation({
    mutationFn: ({ churchId, instruction }: { churchId: string; instruction?: string }) =>
      call(`/cases/${encodeURIComponent(churchId)}/review`, { instruction }),
  })
}

export function useReviewAll() {
  return useMutation({ mutationFn: () => call('/review-all', {}) })
}

export function useStop() {
  return useMutation({
    mutationFn: (churchId: string) => call(`/cases/${encodeURIComponent(churchId)}/stop`, {}),
  })
}
