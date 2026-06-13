/**
 * Native blob-store path: downloads are staged in blobs-tmp/ and atomically
 * moved into blobs/ after validation, so a partial/truncated download can
 * never appear as a cached blob (hashes are immutable; cache hits never
 * expire). Uses a stateful in-memory FS mock with Platform forced to iOS.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

const fsState = vi.hoisted(() => ({
  files: new Map<string, Uint8Array>(),
  dirs: new Set<string>(),
  download: undefined as undefined | ((url: string, destPath: string) => Promise<void>),
  downloadCalls: 0,
}))

vi.mock('react-native', () => ({ Platform: { OS: 'ios' } }))
vi.mock('@/lib/hearth', () => ({ hearthUrl: (p: string) => `https://hearth.test/${p}` }))
vi.mock('@/lib/idb-fs', () => ({
  idbReadBinary: vi.fn(),
  idbWriteFile: vi.fn(),
  idbDeletePrefix: vi.fn(),
}))
vi.mock('expo-file-system', () => {
  class Directory {
    path: string
    constructor(base: string, rel: string) {
      this.path = `${base}/${rel}`
    }
    get exists() {
      return fsState.dirs.has(this.path)
    }
    create() {
      fsState.dirs.add(this.path)
    }
    delete() {
      fsState.dirs.delete(this.path)
      for (const k of [...fsState.files.keys()]) {
        if (k.startsWith(this.path)) fsState.files.delete(k)
      }
    }
    list() {
      return []
    }
  }
  class File {
    path: string
    constructor(base: string, rel: string) {
      this.path = `${base}/${rel}`
    }
    get exists() {
      return fsState.files.has(this.path)
    }
    get size() {
      return fsState.files.get(this.path)?.byteLength ?? 0
    }
    get uri() {
      return `file://${this.path}`
    }
    write(data: Uint8Array) {
      fsState.files.set(this.path, data)
    }
    delete() {
      fsState.files.delete(this.path)
    }
    async bytes() {
      const b = fsState.files.get(this.path)
      if (!b) throw new Error(`bytes(): missing ${this.path}`)
      return b
    }
    move(dest: { path: string }) {
      const b = fsState.files.get(this.path)
      if (!b) throw new Error(`move(): missing ${this.path}`)
      fsState.files.delete(this.path)
      fsState.files.set(dest.path, b)
    }
    static async downloadFileAsync(url: string, dest: { path: string }) {
      fsState.downloadCalls++
      if (!fsState.download) throw new Error('no download impl configured')
      await fsState.download(url, dest.path)
    }
  }
  return { Directory, File, Paths: { document: '/doc' } }
})

import { blobPath, ensureBlobCached, getBlob } from './store'

const hash = 'aabb1234'
const blobAbsPath = `/doc/${blobPath(hash)}`
const tmpAbsPath = `/doc/blobs-tmp/${hash}`

function setDownloadSuccess(bytes: Uint8Array) {
  fsState.download = async (_url, destPath) => {
    fsState.files.set(destPath, bytes)
  }
}

beforeEach(() => {
  fsState.files.clear()
  fsState.dirs.clear()
  fsState.download = undefined
  fsState.downloadCalls = 0
  vi.unstubAllGlobals()
})

describe('ensureBlobCached — native download path', () => {
  it('downloads to blobs-tmp/ then moves into blobs/', async () => {
    const payload = new Uint8Array([1, 2, 3, 4])
    setDownloadSuccess(payload)

    await ensureBlobCached(hash, payload.byteLength)

    expect(fsState.files.get(blobAbsPath)).toEqual(payload)
    expect(fsState.files.has(tmpAbsPath)).toBe(false)
    expect(fsState.downloadCalls).toBe(1)
  })

  it('is a no-op when the blob is already cached', async () => {
    fsState.files.set(blobAbsPath, new Uint8Array([9]))

    await ensureBlobCached(hash)

    expect(fsState.downloadCalls).toBe(0)
  })

  it('rejects a size mismatch, cleans tmp, and never writes blobs/', async () => {
    setDownloadSuccess(new Uint8Array([1, 2])) // truncated: expected 4 bytes
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      }),
    )

    await expect(ensureBlobCached(hash, 4)).rejects.toThrow()

    expect(fsState.files.has(blobAbsPath)).toBe(false)
    expect(fsState.files.has(tmpAbsPath)).toBe(false)
    warnSpy.mockRestore()
  })

  it('falls back to the JS fetch path when the native download fails', async () => {
    fsState.download = async () => {
      throw new Error('response has status 500')
    }
    const payload = new Uint8Array([7, 7, 7])
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        arrayBuffer: async () => payload.buffer.slice(0),
      })),
    )

    await ensureBlobCached(hash)

    expect(fsState.files.get(blobAbsPath)).toEqual(payload)
    expect(fsState.files.has(tmpAbsPath)).toBe(false)
    warnSpy.mockRestore()
  })

  it('dedupes concurrent calls for the same hash into one download', async () => {
    let release: (() => void) | undefined
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    const payload = new Uint8Array([5, 5])
    fsState.download = async (_url, destPath) => {
      await gate
      fsState.files.set(destPath, payload)
    }

    const a = ensureBlobCached(hash)
    const b = ensureBlobCached(hash)
    release?.()
    await Promise.all([a, b])

    expect(fsState.downloadCalls).toBe(1)
    expect(fsState.files.get(blobAbsPath)).toEqual(payload)
  })

  it('getBlob reads the bytes back after a native download', async () => {
    const payload = new Uint8Array([42, 43])
    setDownloadSuccess(payload)

    const bytes = await getBlob(hash)

    expect(bytes).toEqual(payload)
    expect(fsState.downloadCalls).toBe(1)
  })
})
