import { create } from 'zustand'

/** What this device needs to be one of an account's: kept here only, never in the log. */
export type Account = { secret: string; device: string; token: string }

export type SyncState =
  /** Nothing waiting, as far as the last exchange showed. */
  | 'ok'
  | 'syncing'
  /** The relay can't be reached; changes are kept here until it can. */
  | 'waiting'
  /** Another device writes a newer log than this app reads. */
  | 'outdated'
  /** The account holds as much as the relay keeps for one. */
  | 'full'

type SyncStatus = {
  /** False until the account has been looked for in the database. */
  loaded: boolean
  account: Account | undefined
  state: SyncState
  syncedAt: number | undefined
}

export const useSync = create<SyncStatus>()(() => ({
  loaded: false,
  account: undefined,
  state: 'ok',
  syncedAt: undefined,
}))
