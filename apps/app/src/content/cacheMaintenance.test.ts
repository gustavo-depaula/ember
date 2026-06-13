import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }))
vi.mock('@/db/repositories/preferences', () => ({
  getPreference: vi.fn(),
  setPreference: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('@/features/pinning/pinningManager', () => ({
  pinnedHashes: vi.fn().mockResolvedValue(new Set<string>()),
}))
vi.mock('./store', () => ({
  clearBlobTmp: vi.fn().mockResolvedValue(undefined),
  evictTo: vi.fn().mockResolvedValue({ totalBytes: 0, deleted: 0 }),
}))

import { getPreference, setPreference } from '@/db/repositories/preferences'
import { pinnedHashes } from '@/features/pinning/pinningManager'
import { maybeRunCacheEviction } from './cacheMaintenance'
import { clearBlobTmp, evictTo } from './store'

beforeEach(() => {
  vi.mocked(getPreference).mockReset().mockResolvedValue(undefined)
  vi.mocked(setPreference).mockClear()
  vi.mocked(evictTo).mockClear()
  vi.mocked(clearBlobTmp).mockClear()
  vi.mocked(pinnedHashes).mockClear()
})

describe('maybeRunCacheEviction — 24h gate', () => {
  it('runs when never run before, then stamps the timestamp', async () => {
    await maybeRunCacheEviction()

    expect(clearBlobTmp).toHaveBeenCalledOnce()
    expect(pinnedHashes).toHaveBeenCalledOnce()
    expect(evictTo).toHaveBeenCalledOnce()
    expect(setPreference).toHaveBeenCalledWith('last-eviction-at', expect.any(String))
    const stamped = Number(vi.mocked(setPreference).mock.calls[0][1])
    expect(Math.abs(Date.now() - stamped)).toBeLessThan(5000)
  })

  it('skips when the last run is fresh', async () => {
    vi.mocked(getPreference).mockResolvedValue(String(Date.now() - 60 * 60 * 1000))

    await maybeRunCacheEviction()

    expect(evictTo).not.toHaveBeenCalled()
    expect(pinnedHashes).not.toHaveBeenCalled()
    expect(setPreference).not.toHaveBeenCalled()
  })

  it('runs when the last run is older than 24h', async () => {
    vi.mocked(getPreference).mockResolvedValue(String(Date.now() - 25 * 60 * 60 * 1000))

    await maybeRunCacheEviction()

    expect(evictTo).toHaveBeenCalledOnce()
    expect(setPreference).toHaveBeenCalledOnce()
  })

  it('does not stamp when eviction throws (retries next launch)', async () => {
    vi.mocked(evictTo).mockRejectedValueOnce(new Error('disk error'))

    await expect(maybeRunCacheEviction()).rejects.toThrow('disk error')
    expect(setPreference).not.toHaveBeenCalled()
  })
})
