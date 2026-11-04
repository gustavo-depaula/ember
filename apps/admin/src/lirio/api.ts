import type { Resolution } from '@ember/api/src/moderation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { LirioDesk, LirioItem } from '../../worker/types'
import { call } from '../api'
import { readLirioZip } from './unzip'

const lirioKey = ['lirio']

export function useLirio() {
  return useQuery({ queryKey: lirioKey, queryFn: () => call<LirioDesk>('/lirio') })
}

// Every write answers with the Lírio desk as it now stands.
function useLirioMutation<Input, Output extends LirioDesk = LirioDesk>(
  request: (input: Input) => Promise<Output>,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: request,
    onSuccess: (desk) => {
      client.setQueryData(lirioKey, desk)
      // The moderation desk's change log now holds what this applied.
      void client.invalidateQueries({ queryKey: ['desk'] })
    },
  })
}

export function useUpload() {
  return useLirioMutation(async (file: File) =>
    call<LirioDesk & { report: string }>('/lirio/upload', { churches: await readLirioZip(file) }),
  )
}

export function useMatch() {
  return useLirioMutation(({ id, churchId }: { id: string; churchId?: string }) =>
    call<LirioDesk>(`/lirio/items/${id}/match`, { churchId }),
  )
}

// The resolution goes with what this page saw of our church, so the Worker refuses it if the church
// changed in the meantime.
export function useApplyLirio() {
  return useLirioMutation(({ item, resolution }: { item: LirioItem; resolution: Resolution }) =>
    call<LirioDesk>(`/lirio/items/${item.id}/apply`, {
      resolution,
      seen: item.church ? { [item.church.id]: item.church.updatedAt } : {},
    }),
  )
}

export function useSkip() {
  return useLirioMutation((id: string) => call<LirioDesk>(`/lirio/items/${id}/skip`, {}))
}
