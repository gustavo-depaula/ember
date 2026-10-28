// A browser that is one of an account's devices: its database is opened, its
// log folded, and the account kept in step while a page of the site is open.
// Loaded by `boot.ts` only for such a browser, and on the page that connects one.
import { replayAll } from '@/db/events'
import { loadAccount, startSync } from '@/features/sync/engine'
import { useSync } from '@/features/sync/state'
import { openDatabase } from '~/platform/browser/dbClient'
import { connected } from './connected'

const listeners = new Set<() => void>()

/** Runs `listener` whenever the log changes under the page: another tab wrote, or another device's changes came in. */
export function onLogChanged(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function changed() {
  for (const listener of listeners) listener()
}

let keeping = false

/**
 * Keeps the account in step from this tab: on opening, a few seconds after a
 * change made here, on coming back into view, and about once a minute while
 * in view. Every tab does so for itself, as a tab left in the background
 * fetches nothing: two tabs sending the same change is harmless, since the
 * relay keeps an event once however often it arrives.
 */
export function keepInStep(): void {
  connected.set(true)
  if (keeping) return
  keeping = true
  startSync(changed)
}

async function start() {
  await openDatabase(() => {
    Promise.all([replayAll(), loadAccount()]).then(() => {
      // An account removed from this browser in another tab.
      if (!useSync.getState().account) connected.set(false)
      changed()
    })
  })
  await loadAccount()
  if (useSync.getState().account) {
    keepInStep()
    if (document.querySelector('[data-plan]')) (await import('./plan')).mountPlan()
  } else {
    connected.set(false)
  }

  const connect = document.querySelector<HTMLElement>('[data-connect]')
  if (connect) (await import('./connect')).mountConnect(connect)
}

start()
