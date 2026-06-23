// Reader Sync lifecycle. Owns the local server's life: starts it on demand,
// keeps the screen awake while it runs, and tears it down when the app
// backgrounds (the iOS TCP listener can't survive backgrounding) — re-arming
// when the user returns. The UI just calls start()/stop() and renders `status`.

import { useQueryClient } from '@tanstack/react-query'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { getToday } from '@/hooks/useToday'
import { collectDailyDocuments } from '../documents/collectDocuments'
import type { ServerHandle } from '../types'
import { startReaderSync } from './localServer'

const KEEP_AWAKE_TAG = 'reader-sync'

export type ReaderSyncStatus = 'idle' | 'starting' | 'running' | 'error'

export type ReaderSync = {
  status: ReaderSyncStatus
  url?: string
  ip?: string
  error?: string
  start: () => Promise<void>
  stop: () => Promise<void>
}

export function useReaderSync(): ReaderSync {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ReaderSyncStatus>('idle')
  const [handle, setHandle] = useState<ServerHandle | undefined>()
  const [error, setError] = useState<string>()
  const handleRef = useRef<ServerHandle | undefined>(undefined)
  const wasRunning = useRef(false)

  const start = useCallback(async () => {
    if (handleRef.current) return
    setStatus('starting')
    setError(undefined)
    try {
      const documents = collectDailyDocuments({ queryClient, date: getToday() })
      const next = await startReaderSync({ documents })
      handleRef.current = next
      wasRunning.current = true
      setHandle(next)
      setStatus('running')
      await activateKeepAwakeAsync(KEEP_AWAKE_TAG)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }, [queryClient])

  const stop = useCallback(async () => {
    wasRunning.current = false
    deactivateKeepAwake(KEEP_AWAKE_TAG)
    const current = handleRef.current
    handleRef.current = undefined
    setHandle(undefined)
    setStatus('idle')
    if (current) await current.stop()
  }, [])

  // The iOS listener dies on backgrounding; tear it down cleanly and re-arm on
  // return so the URL/IP the user sees stays valid.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background' && handleRef.current) {
        deactivateKeepAwake(KEEP_AWAKE_TAG)
        const current = handleRef.current
        handleRef.current = undefined
        setHandle(undefined)
        setStatus('idle')
        void current.stop()
      } else if (state === 'active' && wasRunning.current && !handleRef.current) {
        void start()
      }
    })
    return () => sub.remove()
  }, [start])

  useEffect(() => {
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG)
      void handleRef.current?.stop()
    }
  }, [])

  return { status, url: handle?.url, ip: handle?.ip, error, start, stop }
}
