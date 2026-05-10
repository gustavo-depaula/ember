/**
 * Pure state-machine tests for the creators store. The audio backend is
 * injected via `setBackend` so this runs without expo-audio / React Native.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AudioBackend, NowPlayingItem } from './creatorsStore'
import { useCreatorsStore } from './creatorsStore'

const item: NowPlayingItem = {
  itemId: 'episode-1',
  creatorId: 'creator/test',
  title: 'A test episode',
  mediaUrl: 'https://example.org/audio.mp3',
  durationS: 600,
}

function makeBackend(): AudioBackend & { calls: string[] } {
  const calls: string[] = []
  return {
    calls,
    async load(uri: string) {
      calls.push(`load:${uri}`)
    },
    async play() {
      calls.push('play')
    },
    async pause() {
      calls.push('pause')
    },
    async seek(s: number) {
      calls.push(`seek:${s}`)
    },
    async setRate(r: number) {
      calls.push(`rate:${r}`)
    },
    async unload() {
      calls.push('unload')
    },
  }
}

describe('creatorsStore', () => {
  beforeEach(() => {
    useCreatorsStore.getState().reset()
  })

  it('starts in stopped state', () => {
    const s = useCreatorsStore.getState()
    expect(s.nowPlaying).toBeUndefined()
    expect(s.isPlaying).toBe(false)
    expect(s.positionS).toBe(0)
    expect(s.speed).toBe(1)
  })

  it('play() loads, plays, and sets nowPlaying', async () => {
    const backend = makeBackend()
    useCreatorsStore.getState().setBackend(backend)
    await useCreatorsStore.getState().play(item)

    const s = useCreatorsStore.getState()
    expect(s.nowPlaying?.itemId).toBe('episode-1')
    expect(s.isPlaying).toBe(true)
    expect(backend.calls).toEqual(['load:https://example.org/audio.mp3', 'play'])
  })

  it('togglePlay() pauses then resumes the same item', async () => {
    const backend = makeBackend()
    useCreatorsStore.getState().setBackend(backend)
    await useCreatorsStore.getState().play(item)
    backend.calls.length = 0

    await useCreatorsStore.getState().togglePlay()
    expect(useCreatorsStore.getState().isPlaying).toBe(false)
    expect(backend.calls).toEqual(['pause'])

    await useCreatorsStore.getState().togglePlay()
    expect(useCreatorsStore.getState().isPlaying).toBe(true)
    expect(backend.calls).toEqual(['pause', 'play'])
  })

  it('play() with a different item unloads first', async () => {
    const backend = makeBackend()
    useCreatorsStore.getState().setBackend(backend)
    await useCreatorsStore.getState().play(item)
    backend.calls.length = 0

    const second: NowPlayingItem = { ...item, itemId: 'episode-2', mediaUrl: 'https://x/b.mp3' }
    await useCreatorsStore.getState().play(second)

    expect(useCreatorsStore.getState().nowPlaying?.itemId).toBe('episode-2')
    expect(backend.calls).toEqual(['unload', 'load:https://x/b.mp3', 'play'])
  })

  it('stop() clears nowPlaying and unloads', async () => {
    const backend = makeBackend()
    useCreatorsStore.getState().setBackend(backend)
    await useCreatorsStore.getState().play(item)
    backend.calls.length = 0

    await useCreatorsStore.getState().stop()
    expect(useCreatorsStore.getState().nowPlaying).toBeUndefined()
    expect(useCreatorsStore.getState().isPlaying).toBe(false)
    expect(backend.calls).toEqual(['unload'])
  })

  it('setSpeed() forwards to backend and updates state', async () => {
    const backend = makeBackend()
    useCreatorsStore.getState().setBackend(backend)
    await useCreatorsStore.getState().play(item)
    backend.calls.length = 0

    await useCreatorsStore.getState().setSpeed(1.5)
    expect(useCreatorsStore.getState().speed).toBe(1.5)
    expect(backend.calls).toEqual(['rate:1.5'])
  })

  it('seek() forwards to backend and updates state', async () => {
    const backend = makeBackend()
    useCreatorsStore.getState().setBackend(backend)
    await useCreatorsStore.getState().play(item)
    backend.calls.length = 0

    await useCreatorsStore.getState().seek(120)
    expect(useCreatorsStore.getState().positionS).toBe(120)
    expect(backend.calls).toEqual(['seek:120'])
  })

  it('togglePlay() with no nowPlaying is a no-op', async () => {
    const backend = makeBackend()
    useCreatorsStore.getState().setBackend(backend)
    await useCreatorsStore.getState().togglePlay()
    expect(backend.calls).toEqual([])
    expect(useCreatorsStore.getState().isPlaying).toBe(false)
  })

  it('onTick() updates positionS without re-loading', async () => {
    const backend = makeBackend()
    useCreatorsStore.getState().setBackend(backend)
    await useCreatorsStore.getState().play(item)
    backend.calls.length = 0

    useCreatorsStore.getState().onTick(42)
    expect(useCreatorsStore.getState().positionS).toBe(42)
    expect(backend.calls).toEqual([])
  })
})

// Silence warning about unused import in case test runner detects.
void vi
