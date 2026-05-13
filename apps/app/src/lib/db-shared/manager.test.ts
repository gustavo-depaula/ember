import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CrossTabPayload } from './protocol'
import { CHANNEL_NAME } from './protocol'

vi.mock('react-native', () => ({ Platform: { OS: 'web' } }))
vi.mock('expo-sqlite', () => ({ openDatabaseAsync: vi.fn() }))
vi.mock('@/db/migrations/0001_initial.sql', () => ({ default: '' }))
vi.mock('@/db/events/store', () => ({ eventsTableSql: '' }))

class FakeBroadcastChannel {
  static byName = new Map<string, FakeBroadcastChannel[]>()
  onmessage: ((ev: { data: unknown }) => void) | null = null

  constructor(public name: string) {
    const arr = FakeBroadcastChannel.byName.get(name) ?? []
    arr.push(this)
    FakeBroadcastChannel.byName.set(name, arr)
  }

  postMessage(data: unknown) {
    // BroadcastChannel never echoes to the sender.
    const peers = (FakeBroadcastChannel.byName.get(this.name) ?? []).filter((c) => c !== this)
    for (const peer of peers) {
      // Real BroadcastChannel delivers async; queueMicrotask is close enough
      // and keeps tests deterministic with `await flushMicrotasks()`.
      queueMicrotask(() => peer.onmessage?.({ data }))
    }
  }

  close() {
    const arr = FakeBroadcastChannel.byName.get(this.name) ?? []
    FakeBroadcastChannel.byName.set(
      this.name,
      arr.filter((c) => c !== this),
    )
  }

  static reset() {
    FakeBroadcastChannel.byName.clear()
  }
}

async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => queueMicrotask(resolve))
}

beforeEach(() => {
  FakeBroadcastChannel.reset()
  vi.stubGlobal('BroadcastChannel', FakeBroadcastChannel)
  vi.resetModules()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('subscribeChanges buffer', () => {
  it('buffers broadcasts arriving before first subscriber, drains on attach', async () => {
    const { broadcastChange, subscribeChanges } = await import('./manager')

    // broadcastChange opens this tab's BroadcastChannel as a side effect.
    // The payload itself goes only to peers (and we have none yet).
    broadcastChange({ kind: 'invalidate', tags: ['anchor'] })

    // Simulate another tab broadcasting two payloads before we subscribe.
    const peer = new FakeBroadcastChannel(CHANNEL_NAME)
    const first: CrossTabPayload = { kind: 'invalidate', tags: ['preferences'] }
    const second: CrossTabPayload = { kind: 'invalidate', tags: ['something-else'] }
    peer.postMessage({ type: 'broadcast', originId: 'peer-tab', payload: first })
    peer.postMessage({ type: 'broadcast', originId: 'peer-tab', payload: second })

    await flushMicrotasks()

    const received: CrossTabPayload[] = []
    subscribeChanges((p) => received.push(p))

    expect(received).toEqual([first, second])
  })

  it('delivers live to subscribers after the first attach and skips buffering', async () => {
    const { broadcastChange, subscribeChanges } = await import('./manager')

    broadcastChange({ kind: 'invalidate', tags: ['anchor'] })

    const received: CrossTabPayload[] = []
    subscribeChanges((p) => received.push(p))

    const peer = new FakeBroadcastChannel(CHANNEL_NAME)
    const payload: CrossTabPayload = { kind: 'invalidate', tags: ['preferences'] }
    peer.postMessage({ type: 'broadcast', originId: 'peer-tab', payload })

    await flushMicrotasks()

    expect(received).toEqual([payload])
  })

  it('ignores our own broadcasts (originId === tabId)', async () => {
    const { broadcastChange, subscribeChanges } = await import('./manager')

    const received: CrossTabPayload[] = []
    subscribeChanges((p) => received.push(p))

    broadcastChange({ kind: 'invalidate', tags: ['preferences'] })

    await flushMicrotasks()

    expect(received).toEqual([])
  })

  it('drain on first attach is one-shot — a later subscriber gets only live', async () => {
    const { broadcastChange, subscribeChanges } = await import('./manager')

    broadcastChange({ kind: 'invalidate', tags: ['anchor'] })

    const peer = new FakeBroadcastChannel(CHANNEL_NAME)
    const buffered: CrossTabPayload = { kind: 'invalidate', tags: ['preferences'] }
    peer.postMessage({ type: 'broadcast', originId: 'peer-tab', payload: buffered })
    await flushMicrotasks()

    // First subscriber drains the buffer.
    const firstReceived: CrossTabPayload[] = []
    const unsubFirst = subscribeChanges((p) => firstReceived.push(p))
    expect(firstReceived).toEqual([buffered])
    unsubFirst()

    // Second subscriber attaches; nothing buffered now, only live deliveries.
    const secondReceived: CrossTabPayload[] = []
    subscribeChanges((p) => secondReceived.push(p))
    expect(secondReceived).toEqual([])

    const live: CrossTabPayload = { kind: 'invalidate', tags: ['live'] }
    peer.postMessage({ type: 'broadcast', originId: 'peer-tab', payload: live })
    await flushMicrotasks()

    expect(secondReceived).toEqual([live])
  })
})
